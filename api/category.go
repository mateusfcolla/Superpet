package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	db "super-pet-delivery/db/sqlc"

	"github.com/gin-gonic/gin"
)

type createCategoryRequest struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description" validate:"required"`
}

func (server *Server) createCategory(ctx *gin.Context) {
	var req createCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.CreateCategoryParams{
		Name:        req.Name,
		Description: req.Description,
	}

	category, err := server.store.CreateCategory(ctx, arg)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, category)
}

type getCategoryRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) getCategory(ctx *gin.Context) {
	var req getCategoryRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	category, err := server.store.GetCategory(ctx, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, category)
}

type listCategoryResponse struct {
	Total      int64         `json:"total"`
	Categories []db.Category `json:"categories"`
}

type listCategoryRequest struct {
	PageID   int32 `form:"page_id" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=50"`
}

func (server *Server) listCategory(ctx *gin.Context) {
	var req listCategoryRequest

	total, err := server.store.CountCategory(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.ListCategoriesParams{
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	}

	categories, err := server.store.ListCategories(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := listCategoryResponse{
		Total:      total,
		Categories: categories,
	}

	ctx.JSON(http.StatusOK, response)
}

type updateCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (server *Server) updateCategory(ctx *gin.Context) {
	var req updateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	categoryID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	fmt.Println(categoryID)
	if err != nil {
		fmt.Println("error in parsing id")
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Fetch the existing category data from db
	existingCategory, err := server.store.GetCategory(ctx, categoryID)
	if err != nil {
		fmt.Println("error in getting category")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Update only the fields that are provided in the request
	if req.Name != "" {
		existingCategory.Name = req.Name
	}
	if req.Description != "" {
		existingCategory.Description = req.Description
	}

	arg := db.UpdateCategoryParams{
		ID:          categoryID,
		Name:        existingCategory.Name,
		Description: existingCategory.Description,
	}

	// Perform the update operation with the modified category data
	category, err := server.store.UpdateCategory(ctx, arg)
	if err != nil {
		fmt.Println("error in updating category")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, category)
}

type deleteCategoryRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

type listTestResponse struct {
	Response []db.Product `json:"response"`
	Message  string       `json:"message"`
}

func (server *Server) deleteCategory(ctx *gin.Context) {
	var req deleteCategoryRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	response, err := server.store.ListProductsByCategory(ctx, req.ID)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	arg := listTestResponse{
		Response: response,
		Message:  "Category has products",
	}

	// if the category has products, dissasoicate them first through the code
	if len(response) > 0 {
		for _, product := range response {
			arg := db.DisassociateProductFromCategoryParams{
				CategoryID: req.ID,
				ProductID:  product.ID,
			}

			_, err := server.store.DisassociateProductFromCategory(ctx, arg)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, errorResponse(err))
				return
			}

			// Remove category from product's categories array
			newCategories := []int64{}
			for _, category := range product.Categories {
				if category != req.ID {
					newCategories = append(newCategories, category)
				}
			}

			updateReq := db.UpdateProductParams{
				ID:          product.ID,
				Name:        product.Name,
				Description: product.Description,
				UserID:      product.UserID,
				Username:    product.Username,
				Price:       product.Price,
				Sku:         product.Sku,
				Url:         product.Url,
				Images:      product.Images,
				Categories:  newCategories,
			}

			_, err = server.store.UpdateProduct(ctx, updateReq)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, errorResponse(err))
				return
			}
		}
	}

	// delete existing category
	err = server.store.DeleteCategory(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	arg = listTestResponse{
		Response: response,
		Message:  "Category deleted successfully",
	}

	ctx.JSON(http.StatusOK, arg)
}

type associateCategoryWithProductRequest struct {
	CategoryID int64 `uri:"category_id" binding:"required,min=1"`
	ProductID  int64 `uri:"product_id" binding:"required,min=1"`
}

func (server *Server) associateCategoryWithProduct(ctx *gin.Context) {
	var req associateCategoryWithProductRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.AssociateProductWithCategoryParams{
		CategoryID: req.CategoryID,
		ProductID:  req.ProductID,
	}

	category, err := server.store.AssociateProductWithCategory(ctx, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, category)
}

type disassociateCategoryWithProductRequest struct {
	CategoryID int64 `uri:"category_id" binding:"required,min=1"`
	ProductID  int64 `uri:"product_id" binding:"required,min=1"`
}

func (server *Server) disassociateCategoryWithProduct(ctx *gin.Context) {
	var req disassociateCategoryWithProductRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.DisassociateProductFromCategoryParams{
		CategoryID: req.CategoryID,
		ProductID:  req.ProductID,
	}

	category, err := server.store.DisassociateProductFromCategory(ctx, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, category)
}

type listProductCategoriesRequest struct {
	ProductID int64 `uri:"product_id" binding:"required,min=1"`
}

func (server *Server) listProductCategories(ctx *gin.Context) {
	var req listProductCategoriesRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	categories, err := server.store.ListCategoriesByProduct(ctx, req.ProductID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, categories)
}

type associateMultipleCategoriesWithProductUri struct {
	ProductID int64 `uri:"product_id" binding:"required,min=1"`
}

type associateMultipleCategoriesWithProductJson struct {
	Categories []struct {
		ID int64 `json:"id"`
	} `json:"categories" binding:"required,dive"`
}

func (server *Server) associateMultipleCategoriesWithProduct(ctx *gin.Context) {
	var uri associateMultipleCategoriesWithProductUri
	if err := ctx.ShouldBindUri(&uri); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var json associateMultipleCategoriesWithProductJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get the list of currently associated categories
	currentCategories, err := server.store.ListCategoriesByProduct(ctx, uri.ProductID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Create a map for quick lookup
	currentCategoryMap := make(map[int64]bool)
	for _, category := range currentCategories {
		currentCategoryMap[category.ID] = true
	}

	for _, category := range json.Categories {
		// If the category is not already associated, associate it
		if !currentCategoryMap[category.ID] {
			arg := db.AssociateProductWithCategoryParams{
				CategoryID: category.ID,
				ProductID:  uri.ProductID,
			}

			_, err = server.store.AssociateProductWithCategory(ctx, arg)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, errorResponse(err))
				return
			}
		}
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success"})
}

type disassociateMultipleCategoriesWithProductUri struct {
	ProductID int64 `uri:"product_id" binding:"required,min=1"`
}

type disassociateMultipleCategoriesWithProductJson struct {
	CategoryIDs []int64 `json:"category_ids" binding:"required,dive,min=1"`
}

func (server *Server) disassociateMultipleCategoriesWithProduct(ctx *gin.Context) {
	var uri disassociateMultipleCategoriesWithProductUri
	if err := ctx.ShouldBindUri(&uri); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var json disassociateMultipleCategoriesWithProductJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	for _, categoryID := range json.CategoryIDs {
		arg := db.DisassociateProductFromCategoryParams{
			CategoryID: categoryID,
			ProductID:  uri.ProductID,
		}

		_, err := server.store.DisassociateProductFromCategory(ctx, arg)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success"})
}
