package api

import (
	"database/sql"
	"strings"
	db "super-pet-delivery/db/sqlc"
	"unicode"

	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

type createProductRequest struct {
	Name        string   `json:"name" validate:"required"`
	Description string   `json:"description" validate:"required"`
	UserID      int64    `json:"user_id" validate:"required"`
	Price       string   `json:"price"`
	OldPrice    string   `json:"old_price"`
	Sku         string   `json:"sku"`
	Images      []string `json:"images"`
	Categories  []int64  `json:"categories"`
}

func sanitizeName(name string) string {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	result, _, _ := transform.String(t, name)

	// Replace spaces with hyphens
	sanitized := strings.ReplaceAll(result, " ", "-")
	// Convert to lowercase
	sanitized = strings.ToLower(sanitized)
	// URL encode to handle special characters
	sanitized = url.PathEscape(sanitized)
	return sanitized
}

func (server *Server) createProduct(ctx *gin.Context) {
	var req createProductRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	productPrice := 0.0
	oldPrice := 0.0
	productImages := []string{}
	productSku := ""
	productCategories := []int64{}
	if req.Price != "" {
		price, err := strconv.ParseFloat(strings.Replace(req.Price, ",", ".", -1), 64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(err))
			return
		}
		productPrice = price
	}
	if req.OldPrice != "" {
		price, err := strconv.ParseFloat(strings.Replace(req.OldPrice, ",", ".", -1), 64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(err))
			return
		}
		oldPrice = price
	}
	if len(req.Images) > 0 {
		productImages = req.Images
	}
	if req.Sku != "" {
		productSku = req.Sku
	}
	if len(req.Categories) > 0 {
		productCategories = req.Categories
	}

	user, err := server.store.GetUser(ctx, req.UserID)
	if err != nil {
		// if theres no user, redirect to login
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	baseURL := sanitizeName(req.Name)
	url := baseURL
	i := 1
	for {
		_, err := server.store.GetProductByURL(ctx, url)
		if err == sql.ErrNoRows {
			break
		}
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
		url = fmt.Sprintf("%s-%d", baseURL, i)
		i++
	}

	arg := db.CreateProductParams{
		Name:        req.Name,
		Description: req.Description,
		UserID:      req.UserID,
		Username:    user.Username,
		Price:       productPrice,
		OldPrice:    oldPrice,
		Sku:         productSku,
		Url:         url,
		Images:      productImages,
		Categories:  productCategories,
	}

	product, err := server.store.CreateProduct(ctx, arg)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, product)
}

type getProductByURLRequest struct {
	URL string `uri:"url" binding:"required"`
}

func (server *Server) getProductByURL(ctx *gin.Context) {
	var req getProductByURLRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	product, err := server.store.GetProductByURL(ctx, req.URL)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, product)
}

type getProductRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) getProduct(ctx *gin.Context) {
	var req getProductRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	product, err := server.store.GetProduct(ctx, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, product)
}

type listProductResponse struct {
	Total    int64        `json:"total"`
	Products []db.Product `json:"products"`
}

type listProductRequest struct {
	PageID        int32   `form:"page_id" binding:"required,min=1"`
	PageSize      int32   `form:"page_size" binding:"required,min=5,max=100"`
	SortField     string  `form:"sort_field" binding:""`
	SortDirection string  `form:"sort_direction" binding:""`
	Search        string  `form:"search" binding:""`
	CategoryIDs   []int64 `form:"category_ids" binding:""`
}

func (server *Server) listProduct(ctx *gin.Context) {
	var req listProductRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.ListProductsParams{
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	}

	var total int64
	var err error
	if len(req.CategoryIDs) == 0 && req.SortField == "" && req.SortDirection == "" && req.Search == "" {
		total, err = server.store.CountProducts(ctx)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
	}

	var products []db.Product
	if len(req.CategoryIDs) != 0 {
		// Fetch the paginated products for the given category
		products, total, err = server.store.FilterProducts(ctx, req.CategoryIDs, int(req.PageID), int(req.PageSize), req.SortField, req.SortDirection, req.Search)
	} else if req.SortField != "" && req.SortDirection != "" && req.Search != "" {
		// Fetch the paginated products with sorting and search
		products, total, err = server.store.SearchProducts(ctx, req.Search, int(req.PageID), int(req.PageSize), req.SortField, req.SortDirection)
	} else if req.SortField != "" && req.SortDirection != "" {
		// Fetch the paginated products with sorting
		products, total, err = server.store.ListProductsSorted(ctx, arg, req.SortField, req.SortDirection)
	} else if req.Search != "" {
		// Fetch the paginated products with search
		products, total, err = server.store.SearchProducts(ctx, req.Search, int(req.PageID), int(req.PageSize), "", "")
	} else {
		// Fetch the paginated products without sorting or search
		products, err = server.store.ListProducts(ctx, arg)
	}
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := listProductResponse{
		Total:    total,
		Products: products,
	}

	ctx.JSON(http.StatusOK, response)
}

type listProductsByUserRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) listProductsByUser(ctx *gin.Context) {
	var req listProductsByUserRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	products, err := server.store.ListProductsByUser(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, products)
}

type updateProductRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	UserID      int64    `json:"user_id"`
	Price       string   `json:"price"`
	OldPrice    string   `json:"old_price"`
	Sku         string   `json:"sku"`
	Images      []string `json:"images"`
	Categories  []int64  `json:"categories"`
}

func (server *Server) updateProduct(ctx *gin.Context) {
	var req updateProductRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	productID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	fmt.Println(productID)
	if err != nil {
		fmt.Println("error in parsing id")
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Fetch the existing product data from db
	existingProduct, err := server.store.GetProduct(ctx, productID)
	if err != nil {
		fmt.Println("error in getting product")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	user, err := server.store.GetUser(ctx, req.UserID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	price, err := strconv.ParseFloat(strings.Replace(req.Price, ",", ".", -1), 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	oldPrice, err := strconv.ParseFloat(strings.Replace(req.OldPrice, ",", ".", -1), 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Update only the fields that are provided in the request
	if req.Name != "" {
		existingProduct.Name = req.Name
	}
	if req.Description != "" {
		existingProduct.Description = req.Description
	}
	if req.UserID != 0 {
		existingProduct.UserID = req.UserID
	}
	if req.Price != "" {
		existingProduct.Price = price
	}
	if req.OldPrice != "" {
		existingProduct.OldPrice = oldPrice
	}
	if req.Sku != "" {
		existingProduct.Sku = req.Sku
	}
	if len(req.Images) > 0 {
		existingProduct.Images = req.Images
	}
	if len(req.Categories) > 0 {
		existingProduct.Categories = req.Categories
	}

	baseURL := sanitizeName(existingProduct.Name)
	url := baseURL
	i := 1
	for {
		product, err := server.store.GetProductByURL(ctx, url)
		if err == sql.ErrNoRows {
			break
		}
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
		if product.ID == productID {
			break
		}
		url = fmt.Sprintf("%s-%d", baseURL, i)
		i++
	}

	arg := db.UpdateProductParams{
		ID:          productID,
		Name:        existingProduct.Name,
		Description: existingProduct.Description,
		UserID:      existingProduct.UserID,
		Username:    user.Username,
		Price:       existingProduct.Price,
		OldPrice:    existingProduct.OldPrice,
		Sku:         existingProduct.Sku,
		Url:         url,
		Images:      existingProduct.Images,
		Categories:  existingProduct.Categories,
	}

	// Perform the update operation with the modified product data
	product, err := server.store.UpdateProduct(ctx, arg)
	if err != nil {
		fmt.Println("error in updating product")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, product)
}

type deleteProductRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) deleteProduct(ctx *gin.Context) {
	var req deleteProductRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// delete existing product
	err := server.store.DeleteProduct(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, "Product deleted successfully")
}
