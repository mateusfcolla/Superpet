package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	db "super-pet-delivery/db/sqlc"
	"time"

	"github.com/gin-gonic/gin"
)

func (server *Server) createImage(ctx *gin.Context) {
	// Handle multiple file uploads
	form, _ := ctx.MultipartForm()
	files := form.File["file"]

	var images []db.Image

	for _, file := range files {
		// Check if the file exists
		if file == nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
			return
		}

		// Use the original filename for storing the image
		filename := file.Filename

		// Replace backslashes with forward slashes in filename
		filename = strings.ReplaceAll(filename, "\\", "/")

		// Generate a subdirectory path based on the current month and year
		currentTime := time.Now()
		year := currentTime.Format("2006")
		month := currentTime.Format("01")
		subdirectoryPath := fmt.Sprintf("./media/%s/%s", year, month)

		// Create the subdirectory if it doesn't exist
		if _, err := os.Stat(subdirectoryPath); os.IsNotExist(err) {
			err := os.MkdirAll(subdirectoryPath, 0755)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, errorResponse(err))
				return
			}
		}

		// Check if the file with the same name already exists within the subdirectory
		filePath := filepath.Join(subdirectoryPath, filename)
		fileExists := true
		counter := 1

		for fileExists {
			_, err := os.Stat(filePath)
			if os.IsNotExist(err) {
				fileExists = false
			} else {
				// Append a number to the filename and check again
				filenameWithoutExt := strings.TrimSuffix(filename, filepath.Ext(filename))
				newFilename := fmt.Sprintf("%s_%d%s", filenameWithoutExt, counter, filepath.Ext(filename))
				filePath = filepath.Join(subdirectoryPath, newFilename)
				counter++
			}
		}

		// Save the uploaded file with the unique filename
		err := ctx.SaveUploadedFile(file, filePath)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}

		arg := db.CreateImageParams{
			Name:        filename,
			Description: "",
			Alt:         filename,
			ImagePath:   "/media/" + filepath.Join(year, month, filepath.Base(filePath)), // Store the relative path to the image
		}

		image, err := server.store.CreateImage(ctx, arg)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}

		images = append(images, image)
	}

	ctx.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("%d files uploaded!", len(files)), "images": images})
}

type getImageRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) getImage(ctx *gin.Context) {
	var req getImageRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	image, err := server.store.GetImage(ctx, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, image)
}

type getImagesRequest struct {
	IDs []int64 `json:"ids" binding:"required"`
}

func (server *Server) getImages(ctx *gin.Context) {
	var req getImagesRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var images []db.Image
	for _, id := range req.IDs {
		image, err := server.store.GetImage(ctx, id)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		images = append(images, image)
	}

	ctx.JSON(http.StatusOK, images)
}

type getImagePathRequest struct {
	Year     int64  `uri:"year" binding:"required,min=1"`
	Month    int64  `uri:"month" binding:"required,min=1"`
	Filename string `uri:"filename" binding:"required"`
}

func (server *Server) getImagePath(ctx *gin.Context) {
	var req getImagePathRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Construct the absolute file path based on the parameters
	monthStr := fmt.Sprintf("%02d", req.Month) // Format with zero-padding
	filePath := fmt.Sprintf("./media/%d/%s/%s", req.Year, monthStr, req.Filename)

	fmt.Printf("Constructed file path: %s\n", filePath)

	// Check if the file exists
	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Serve the image file as a response
	ctx.File(filePath)
}

type listImagesResponse struct {
	Total  int64      `json:"total"`
	Images []db.Image `json:"images"`
}
type listImageRequest struct {
	PageID        int32  `form:"page_id" binding:"required,min=1"`
	PageSize      int32  `form:"page_size" binding:"required,min=5,max=20"`
	SortField     string `form:"sort_field" binding:""`
	SortDirection string `form:"sort_direction" binding:""`
	Search        string `form:"search" binding:""`
}

func (server *Server) listImage(ctx *gin.Context) {
	var req listImageRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.ListImagesParams{
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	}

	total, err := server.store.CountImages(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	var images []db.Image
	// Check if sort fields and search are provided
	if req.SortField != "" && req.SortDirection != "" && req.Search != "" {
		// Fetch the paginated images with sorting and search
		images, err = server.store.SearchImages(ctx, req.Search, int(req.PageID), int(req.PageSize), req.SortField, req.SortDirection)
	} else if req.SortField != "" && req.SortDirection != "" {
		// Fetch the paginated images with sorting
		images, err = server.store.ListImagesSorted(ctx, arg, req.SortField, req.SortDirection)
	} else if req.Search != "" {
		// Fetch the paginated images with search
		images, err = server.store.SearchImages(ctx, req.Search, int(req.PageID), int(req.PageSize), "", "")
	} else {
		// Fetch the paginated images without sorting or search
		images, err = server.store.ListImages(ctx, arg)
	}
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := listImagesResponse{
		Total:  total,
		Images: images,
	}

	ctx.JSON(http.StatusOK, response)
}

type updateImageRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Alt         string `json:"alt"`
}

func (server *Server) updateImage(ctx *gin.Context) {
	var req updateImageRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	imageID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	fmt.Println(imageID)
	if err != nil {
		fmt.Println("error in parsing id")
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Fetch the existing image data from db
	existingImage, err := server.store.GetImage(ctx, imageID)
	if err != nil {
		fmt.Println("error in getting image")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Update only the fields that are provided in the request
	if req.Name != "" {
		existingImage.Name = req.Name
	}
	if req.Description != "" {
		existingImage.Description = req.Description
	}
	if req.Alt != "" {
		existingImage.Alt = req.Alt
	}

	arg := db.UpdateImageParams{
		ID:          imageID,
		Name:        existingImage.Name,
		Description: existingImage.Description,
		Alt:         existingImage.Alt,
	}

	// Perform the update operation with the modified image data
	image, err := server.store.UpdateImage(ctx, arg)
	if err != nil {
		fmt.Println("error in updating image")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, image)
}

type deleteImageRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

func (server *Server) deleteImage(ctx *gin.Context) {
	var req deleteImageRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get the image information from the database, including the file path
	image, err := server.store.GetImage(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Construct the absolute file path
	filePath := "." + image.ImagePath

	fmt.Printf("Constructed file path: %s\n", filePath)
	// Check if the file exists
	_, err = os.Stat(filePath)
	if os.IsNotExist(err) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Delete the image file
	err = os.Remove(filePath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Delete the image record from the database
	err = server.store.DeleteImage(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, "Image deleted successfully")
}

type associateImageWithProductRequest struct {
	ImageID   int64 `uri:"image_id" binding:"required,min=1"`
	ProductID int64 `uri:"product_id" binding:"required,min=1"`
}

func (server *Server) associateImageWithProduct(ctx *gin.Context) {
	var req associateImageWithProductRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.AssociateProductWithImageParams{
		ImageID:   req.ImageID,
		ProductID: req.ProductID,
	}

	image, err := server.store.AssociateProductWithImage(ctx, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, image)
}

type disassociateImageWithProductRequest struct {
	ImageID   int64 `uri:"image_id" binding:"required,min=1"`
	ProductID int64 `uri:"product_id" binding:"required,min=1"`
}

func (server *Server) disassociateImageWithProduct(ctx *gin.Context) {
	var req disassociateImageWithProductRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.DisassociateProductFromImageParams{
		ImageID:   req.ImageID,
		ProductID: req.ProductID,
	}

	image, err := server.store.DisassociateProductFromImage(ctx, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, image)
}

type listProductImagesRequest struct {
	ProductID int64 `uri:"product_id" binding:"required,min=1"`
}

func (server *Server) listProductImages(ctx *gin.Context) {
	var req listProductImagesRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	images, err := server.store.ListImagesByProduct(ctx, req.ProductID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, images)
}

type associateMultipleImagesWithProductUri struct {
	ProductID int64 `uri:"product_id" binding:"required,min=1"`
}

type associateMultipleImagesWithProductJson struct {
	Images []struct {
		ID    int64 `json:"id"`
		Order int32 `json:"order"`
	} `json:"images" binding:"required,dive"`
}

func (server *Server) associateMultipleImagesWithProduct(ctx *gin.Context) {
	var uri associateMultipleImagesWithProductUri
	if err := ctx.ShouldBindUri(&uri); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var json associateMultipleImagesWithProductJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get the list of currently associated images
	currentImages, err := server.store.ListImagesByProduct(ctx, uri.ProductID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Create a map for quick lookup
	currentImageMap := make(map[int64]bool)
	for _, image := range currentImages {
		currentImageMap[image.ID] = true
	}

	for _, image := range json.Images {
		// If the image is not already associated, associate it
		if !currentImageMap[image.ID] {
			arg := db.AssociateProductWithImageParams{
				ImageID:   image.ID,
				ProductID: uri.ProductID,
				Order:     image.Order,
			}

			_, err = server.store.AssociateProductWithImage(ctx, arg)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, errorResponse(err))
				return
			}
		}
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success"})
}

type disassociateMultipleImagesWithProductUri struct {
	ProductID int64 `uri:"product_id" binding:"required,min=1"`
}

type disassociateMultipleImagesWithProductJson struct {
	ImageIDs []int64 `json:"image_ids" binding:"required,dive,min=1"`
}

func (server *Server) disassociateMultipleImagesWithProduct(ctx *gin.Context) {
	var uri disassociateMultipleImagesWithProductUri
	if err := ctx.ShouldBindUri(&uri); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var json disassociateMultipleImagesWithProductJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	for _, imageID := range json.ImageIDs {
		arg := db.DisassociateProductFromImageParams{
			ImageID:   imageID,
			ProductID: uri.ProductID,
		}

		_, err := server.store.DisassociateProductFromImage(ctx, arg)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success"})
}

type editImageOrderUri struct {
	ProductID int64 `uri:"product_id" binding:"required,min=1"`
}

type editImageOrderJson struct {
	Images []struct {
		ID    int64 `json:"id" binding:"required,min=1" `
		Order int32 `json:"order" `
	} `json:"images" binding:"required,dive"`
}

func (server *Server) editImageOrder(ctx *gin.Context) {
	var uri editImageOrderUri
	if err := ctx.ShouldBindUri(&uri); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var json editImageOrderJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var updatedRows []db.ProductImage
	for _, image := range json.Images {
		arg := db.EditAssociationParams{
			ProductID: uri.ProductID,
			ImageID:   image.ID,
			Order:     image.Order,
		}

		updatedRow, err := server.store.EditAssociation(ctx, arg)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}

		updatedRows = append(updatedRows, updatedRow)
	}

	ctx.JSON(http.StatusOK, updatedRows)
}
