package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	db "super-pet-delivery/db/sqlc"
	"super-pet-delivery/token"
	"super-pet-delivery/util"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type createUserRequest struct {
	Username string `json:"username" binding:"required"`
	FullName string `json:"full_name"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=User Administrator"`
}

// we use this so the hashed password isnt sent back to the client
type userResponse struct {
	ID                int64     `json:"id"`
	Username          string    `json:"username"`
	FullName          string    `json:"full_name"`
	Email             string    `json:"email"`
	PasswordChangedAt time.Time `json:"password_changed_at"`
	CreatedAt         time.Time `json:"created_at"`
	Role              string    `json:"role"`
}

func newUserResponse(user db.User) userResponse {
	return userResponse{
		ID:                user.ID,
		Username:          user.Username,
		FullName:          user.FullName,
		Email:             user.Email,
		PasswordChangedAt: user.PasswordChangedAt,
		CreatedAt:         user.CreatedAt,
		Role:              user.Role,
	}
}

func (server *Server) createUser(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	currentLoggedInUser, _ := server.store.GetUserByUsername(ctx, authPayload.Username)

	if currentLoggedInUser.Role == "User" {
		ctx.JSON(http.StatusUnauthorized, "You are not authorized to create users, only admins have that privilege")
		return
	}

	var req createUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check if the username contains spaces
	if util.ContainsSpaces(req.Username) {
		ctx.JSON(http.StatusBadRequest, "Username cannot contain spaces")
		return
	}

	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	arg := db.CreateUserParams{
		Username:       req.Username,
		FullName:       req.FullName,
		Email:          req.Email,
		HashedPassword: hashedPassword,
		Role:           req.Role,
	}

	user, err := server.store.CreateUser(ctx, arg)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	rsp := newUserResponse(user)

	ctx.JSON(http.StatusOK, rsp)
}

type getUserRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) getUser(ctx *gin.Context) {
	var req getUserRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	currentLoggedInUser, _ := server.store.GetUserByUsername(ctx, authPayload.Username)

	if currentLoggedInUser.Role == "User" && currentLoggedInUser.ID != req.ID {
		ctx.JSON(http.StatusUnauthorized, "You are only authorized to look at your own info in depth")
		return
	}

	user, err := server.store.GetUser(ctx, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	rsp := newUserResponse(user)

	ctx.JSON(http.StatusOK, rsp)
}

func (server *Server) GetLoggedInUser(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	currentLoggedInUser, err := server.store.GetUserByUsername(ctx, authPayload.Username)

	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	rsp := newUserResponse(currentLoggedInUser)

	ctx.JSON(http.StatusOK, rsp)
}

type listUserRequest struct {
	PageID   int32 `form:"page_id" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=10"`
}

func (server *Server) listUser(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	currentLoggedInUser, _ := server.store.GetUserByUsername(ctx, authPayload.Username)

	if currentLoggedInUser.Role == "User" {
		ctx.JSON(http.StatusUnauthorized, "You are not authorized to list users, only admins have that privilege")
		return
	}

	var req listUserRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.ListUsersParams{
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	}

	users, err := server.store.ListUsers(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, users)
}

type updateUserRequest struct {
	FullName       string `json:"full_name"`
	Email          string `json:"email"`
	HashedPassword string `json:"hashed_password"`
	Role           string `json:"role"`
}

func (server *Server) updateUser(ctx *gin.Context) {
	var req updateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	userID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	fmt.Println(userID)
	if err != nil {
		fmt.Println("error in parsing id")
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	currentLoggedInUser, _ := server.store.GetUserByUsername(ctx, authPayload.Username)

	if currentLoggedInUser.Role == "User" && currentLoggedInUser.ID != userID {
		ctx.JSON(http.StatusUnauthorized, "You are only authorized to edit your profile")
		return
	}

	// Fetch the existing user data from db
	existingUser, err := server.store.GetUser(ctx, userID)
	if err != nil {
		fmt.Println("error in getting user")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if req.FullName != "" {
		existingUser.FullName = req.FullName
	}
	if req.Email != "" {
		existingUser.Email = req.Email
	}
	if req.HashedPassword != "" {
		hashedPassword, err := util.HashPassword(req.HashedPassword)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
		existingUser.HashedPassword = hashedPassword
		// Set the PasswordChangedAt field to the current time
		existingUser.PasswordChangedAt = time.Now()
	}
	if req.Role != "" {
		if currentLoggedInUser.Role == "User" {
			ctx.JSON(http.StatusUnauthorized, "You are not authorized to update your role")
			return
		}
		existingUser.Role = req.Role
	}

	arg := db.UpdateUserParams{
		ID:                userID,
		Username:          existingUser.Username,
		FullName:          existingUser.FullName,
		Email:             existingUser.Email,
		HashedPassword:    existingUser.HashedPassword,
		PasswordChangedAt: existingUser.PasswordChangedAt,
		Role:              existingUser.Role,
	}

	// Perform the update operation with the modified user data
	user, err := server.store.UpdateUser(ctx, arg)
	if err != nil {
		fmt.Println("error in updating user")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, user)
}

type deleteUserRequest struct {
	UserID int64 `json:"user_id"`
}

func (server *Server) deleteUser(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	currentLoggedInUser, _ := server.store.GetUserByUsername(ctx, authPayload.Username)

	if currentLoggedInUser.Role == "User" {
		ctx.JSON(http.StatusUnauthorized, "You are not authorized delete users, only admins have that privilege")
		return
	}

	var req deleteUserRequest
	fmt.Printf("request: before jsonthing %v\n", req)
	if err := ctx.ShouldBind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	fmt.Printf("request: after jsonthing %v\n", req)
	userID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Fetch the existing user data from db
	_, err = server.store.GetUser(ctx, userID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check for existing products associated with the user being deleted
	products, err := server.store.ListProductsByUser(ctx, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(products) > 0 {
		// If products are associated, check if a new user ID is provided in the request body
		if req.UserID != 0 {
			// Update the products' ownership to the new user ID
			for _, p := range products {
				arg := db.UpdateProductParams{
					ID:          p.ID,
					Name:        p.Name,
					Description: p.Description,
					UserID:      req.UserID,
				}
				_, err := server.store.UpdateProduct(ctx, arg)
				if err != nil {
					fmt.Printf("error in updating product: %v\n", err)
					ctx.JSON(http.StatusInternalServerError, errorResponse(err))
					return
				}
				// You can do something with the updatedProduct if needed
			}
		} else {
			// If no new user ID is provided, return an error indicating products are associated
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "User has associated products. Provide a new user ID to reassign products."})
			return
		}
	}

	// delete existing user
	err = server.store.DeleteUser(ctx, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, "User deleted successfully")
}

type loginUserRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" binding:"required,min=6"`
}

type loginUserResponse struct {
	SessionID             uuid.UUID    `json:"session_id"`
	AccessToken           string       `json:"access_token"`
	AccessTokenExpiresAt  time.Time    `json:"access_token_expires_at"`
	RefreshToken          string       `json:"refresh_token"`
	RefreshTokenExpiresAt time.Time    `json:"refresh_token_expires_at"`
	User                  userResponse `json:"user"`
}

func (server *Server) loginUser(ctx *gin.Context) {
	var req loginUserRequest
	var user db.User
	var err error

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if strings.Contains(req.Identifier, "@") {
		user, err = server.store.GetUserByEmail(ctx, req.Identifier)
	} else {
		user, err = server.store.GetUserByUsername(ctx, req.Identifier)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	err = util.CheckPassword(req.Password, user.HashedPassword)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	accessToken, accessPayload, err := server.tokenMaker.CreateToken(
		user.Username,
		server.config.AccessTokenDuration,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	refreshToken, refreshPayload, err := server.tokenMaker.CreateToken(
		user.Username,
		server.config.RefreshTokenDuration,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	session, err := server.store.CreateSession(ctx, db.CreateSessionParams{
		ID:           refreshPayload.ID,
		Username:     user.Username,
		RefreshToken: refreshToken,
		UserAgent:    ctx.Request.UserAgent(), // TODO: fill it
		ClientIp:     ctx.ClientIP(),
		IsBlocked:    false,
		ExpiresAt:    refreshPayload.ExpiredAt,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.SetCookie("access_token", accessToken, int(server.config.AccessTokenDuration.Seconds()), "/", "", false, false)
	// Set the refresh token as an HTTP-only cookie
	ctx.SetCookie("refresh_token", refreshToken, int(server.config.RefreshTokenDuration.Seconds()), "/", "", false, true)
	fmt.Println("cookie successfully set")
	ctx.SetCookie("user_id", strconv.FormatInt(user.ID, 10), int(server.config.AccessTokenDuration.Seconds()), "/", "", false, false)

	rsp := loginUserResponse{
		SessionID:            session.ID,
		AccessToken:          accessToken,
		AccessTokenExpiresAt: accessPayload.ExpiredAt,
		//RefreshToken:          refreshToken,
		RefreshTokenExpiresAt: refreshPayload.ExpiredAt,
		User:                  newUserResponse(user),
	}
	ctx.JSON(http.StatusOK, rsp)
}

func (server *Server) logoutUser(ctx *gin.Context) {
	// Get the session ID from the context
	// sessionID := ctx.MustGet(authorizationPayloadKey).(*token.Payload).ID

	// Clear the access token cookie
	ctx.SetCookie("access_token", "", -1, "/", "", false, false)
	// Clear the refresh token cookie
	ctx.SetCookie("refresh_token", "", -1, "/", "", false, true)
	// Clear the user ID cookie
	ctx.SetCookie("user_id", "", -1, "/", "", false, false)

	ctx.JSON(http.StatusOK, "Successfully logged out")
}
