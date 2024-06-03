package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	db "super-pet-delivery/db/sqlc"
	"time"

	"github.com/gin-gonic/gin"
)

type createSaleRequest struct {
	ClientID    int64  `json:"client_id" binding:"required"`
	Product     string `json:"product" binding:"required"`
	Price       string `json:"price" binding:"required"`
	Observation string `json:"observation" binding:"required"`
}

func (server *Server) createSale(ctx *gin.Context) {
	var req createSaleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	client, err := server.store.GetClient(ctx, req.ClientID)
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

	arg := db.CreateSaleParams{
		ClientID:    req.ClientID,
		ClientName:  client.FullName,
		Product:     req.Product,
		Price:       price,
		Observation: req.Observation,
	}

	sale, err := server.store.CreateSale(ctx, arg)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, sale)
}

type getSaleRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) getSale(ctx *gin.Context) {
	var req getSaleRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	sale, err := server.store.GetSale(ctx, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, sale)
}

type listSaleResponse struct {
	Total int64     `json:"total"`
	Sales []db.Sale `json:"sales"`
}

type listSaleRequest struct {
	PageID        int32  `form:"page_id" binding:"required,min=1"`
	PageSize      int32  `form:"page_size" binding:"required,min=5,max=100"`
	SortField     string `form:"sort_field" binding:""`
	SortDirection string `form:"sort_direction" binding:""`
	Search        string `form:"search" binding:""`
}

func (server *Server) listSale(ctx *gin.Context) {
	var req listSaleRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.ListSalesParams{
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	}

	// Fetch the total number of sales
	total, err := server.store.CountSales(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	var sales []db.Sale
	// Check if sort fields and search are provided
	if req.SortField != "" && req.SortDirection != "" && req.Search != "" {
		// Fetch the paginated sales with sorting and search
		sales, err = server.store.SearchSales(ctx, req.Search, int(req.PageID), int(req.PageSize), req.SortField, req.SortDirection)
	} else if req.SortField != "" && req.SortDirection != "" {
		// Fetch the paginated sales with sorting
		sales, err = server.store.ListSalesSorted(ctx, arg, req.SortField, req.SortDirection)
	} else if req.Search != "" {
		// Fetch the paginated sales with search
		sales, err = server.store.SearchSales(ctx, req.Search, int(req.PageID), int(req.PageSize), "", "")
	} else {
		// Fetch the paginated sales without sorting or search
		sales, err = server.store.ListSales(ctx, arg)
	}
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Create the response structure
	response := listSaleResponse{
		Total: total,
		Sales: sales,
	}

	ctx.JSON(http.StatusOK, response)
}

func (server *Server) listAllSales(ctx *gin.Context) {
	saleIDs, err := server.store.GetAllSaleIDs(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, saleIDs)
}

type GetSalesByDateRequest struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

func (server *Server) GetSalesByDate(ctx *gin.Context) {
	var req GetSalesByDateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate, err := time.Parse(time.RFC3339, req.StartDate)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
		return
	}

	endDate, err := time.Parse(time.RFC3339, req.EndDate)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format"})
		return
	}

	sales, err := server.store.GetSalesByDate(ctx, db.GetSalesByDateParams{
		CreatedAt:   startDate,
		CreatedAt_2: endDate,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, sales)
}

type GetSalesByClientIDRequest struct {
	ClientID int64 `uri:"client_id" binding:"required,min=1"`
}

func (server *Server) GetSalesByClientID(ctx *gin.Context) {
	var req GetSalesByClientIDRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	sales, err := server.store.GetSalesByClientID(ctx, req.ClientID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// count number of sales
	total := int64(len(sales))

	// Extract IDs from sales
	saleIDs := make([]int64, len(sales))
	for i, sale := range sales {
		saleIDs[i] = sale.ID
	}

	ctx.JSON(http.StatusOK, gin.H{"total": total, "sales": saleIDs})
}

type updateSaleRequest struct {
	ClientID    int64  `json:"client_id"`
	Product     string `json:"product"`
	Price       string `json:"price"`
	Observation string `json:"observation"`
}

func (server *Server) updateSale(ctx *gin.Context) {
	var req updateSaleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	saleID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	fmt.Println(saleID)
	if err != nil {
		fmt.Println("error in parsing id")
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Fetch the existing sale data from db
	existingSale, err := server.store.GetSale(ctx, saleID)
	if err != nil {
		fmt.Println("error in getting sale")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	price, err := strconv.ParseFloat(strings.Replace(req.Price, ",", ".", -1), 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	client, err := server.store.GetClient(ctx, req.ClientID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Update only the fields that are provided in the request
	// Conditional Checks for Updating Sale Fields

	if req.Product != "" {
		existingSale.Product = req.Product
	}

	if req.ClientID != 0 {
		existingSale.ClientID = req.ClientID
	}

	if price != 0 {
		existingSale.Price = price
	}

	if req.Observation != "" {
		existingSale.Observation = req.Observation
	}

	arg := db.UpdateSaleParams{
		ID:          saleID,
		ClientID:    existingSale.ClientID,
		ClientName:  client.FullName,
		Product:     existingSale.Product,
		Price:       existingSale.Price,
		Observation: existingSale.Observation,
	}

	// Perform the update operation with the modified sale data
	sale, err := server.store.UpdateSale(ctx, arg)
	if err != nil {
		fmt.Println("error in updating sale")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, sale)
}

type deleteSaleRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) deleteSale(ctx *gin.Context) {
	var req deleteSaleRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Delete existing sale
	err := server.store.DeleteSale(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, "Sale deleted successfully")
}

type deleteSalesRequest struct {
	IDs []int32 `json:"ids" binding:"required,dive,min=1"`
}

func (server *Server) deleteSales(ctx *gin.Context) {
	var req deleteSalesRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Delete existing sales
	err := server.store.DeleteSales(ctx, req.IDs)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, "Sales deleted successfully")
}
