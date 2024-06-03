package api

import (
	"net/http"
	db "super-pet-delivery/db/sqlc"

	"github.com/gin-gonic/gin"
)

type CreateSliderImageJson struct {
	Images []struct {
		ID    int64 `json:"id"`
		Order int32 `json:"order"`
	} `json:"images"`
}

func (server *Server) CreateSliderImage(ctx *gin.Context) {
	var json CreateSliderImageJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var createdImages []db.SliderImageWidget
	for _, image := range json.Images {
		arg := db.CreateSliderImageParams{
			ImageID: image.ID,
			Order:   image.Order,
		}

		createdImage, err := server.store.CreateSliderImage(ctx, arg)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		createdImages = append(createdImages, createdImage)
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "createdImages": createdImages})
}

type ListSliderImagesRequest struct {
	PageID   int32 `form:"page_id" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=20"`
}

type ListSliderImagesResponse struct {
	SliderImages []db.SliderImageWidget
}

func (server *Server) ListSliderImages(ctx *gin.Context) {
	var req ListSliderImagesRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	arg := db.ListSliderImagesParams{
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	}

	sliderImages, err := server.store.ListSliderImages(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := ListSliderImagesResponse{
		SliderImages: sliderImages,
	}

	ctx.JSON(http.StatusOK, response)
}

type UpdateSliderImageJson struct {
	Images []struct {
		ID    int64 `json:"id" binding:"required,min=1"`
		Order int32 `json:"order"`
	} `json:"images" binding:"required,dive"`
}

func (server *Server) UpdateSliderImage(ctx *gin.Context) {
	var json UpdateSliderImageJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var updatedImages []db.SliderImageWidget
	for _, image := range json.Images {
		arg := db.UpdateSliderImageParams{
			ID:    image.ID,
			Order: image.Order,
		}

		updatedImage, err := server.store.UpdateSliderImage(ctx, arg)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		updatedImages = append(updatedImages, updatedImage)
	}

	ctx.JSON(http.StatusOK, updatedImages)
}

type UpdateSliderImageByImageIdJson struct {
	Images []struct {
		ImageID int64 `json:"image_id" binding:"required,min=1"`
		Order   int32 `json:"order"`
	} `json:"images" binding:"required,dive"`
}

func (server *Server) UpdateSliderImageByImageId(ctx *gin.Context) {
	var json UpdateSliderImageByImageIdJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var updatedImages []db.SliderImageWidget
	for _, image := range json.Images {
		arg := db.UpdateSliderImageByImageIdParams{
			ImageID: image.ImageID,
			Order:   image.Order,
		}

		updatedImage, err := server.store.UpdateSliderImageByImageId(ctx, arg)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		updatedImages = append(updatedImages, updatedImage)
	}

	ctx.JSON(http.StatusOK, updatedImages)
}

type DeleteSliderImagesJson struct {
	ImageIDs []int64 `json:"image_ids" binding:"required,dive,min=1"`
}

func (server *Server) DeleteSliderImages(ctx *gin.Context) {
	var json DeleteSliderImagesJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, imageID := range json.ImageIDs {

		err := server.store.DeleteSliderImage(ctx, imageID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success"})
}

func (server *Server) DeleteSliderImagesByImageId(ctx *gin.Context) {
	var json DeleteSliderImagesJson
	if err := ctx.ShouldBindJSON(&json); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, imageID := range json.ImageIDs {
		err := server.store.DeleteByImageId(ctx, imageID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success"})
}
