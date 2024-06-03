package api

import (
	"fmt"
	"log"
	db "super-pet-delivery/db/sqlc"
	"super-pet-delivery/token"
	"super-pet-delivery/util"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
)

// Server serves HTTP requests for our api.
type Server struct {
	config     util.Config
	store      db.SortableStore
	tokenMaker token.Maker
	router     *gin.Engine
}

// NewServer creates a new HTTP server and set up routing.
func NewServer(config util.Config, store db.SortableStore) (*Server, error) {
	tokenMaker, err := token.NewPasetoMaker(config.TokenSymmetricKey)
	if err != nil {
		return nil, fmt.Errorf("cannot create token maker: %w", err)
	}

	server := &Server{
		config:     config,
		store:      store,
		tokenMaker: tokenMaker,
	}

	// Create the initial user
	err = server.createInitialUser(store)
	if err != nil {
		log.Fatal("cannot create initial user:", err)
	}

	// Create dummy data
	// err = server.createDummyData(store)
	// if err != nil {
	// 	log.Fatal("cannot create dummy data:", err)
	// }

	server.setupRouter()
	return server, nil
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Cookie, cookie, Cookies, cookies, accept, origin, Cache-Control, X-Requested-With, Cookie")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func (server *Server) setupRouter() {
	router := gin.Default()

	config := cors.DefaultConfig()
	router.Use(CORSMiddleware())
	authRoutes := router.Group("/").Use(authMiddleware(server.tokenMaker))

	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowHeaders = []string{"Authorization", "Cookie"}

	config.AllowCredentials = true
	//router.Use(cors.New(config))
	authRoutes.Use(cors.New(config))

	router.POST("/users/login", server.loginUser)
	authRoutes.POST("/tokens/renew_access", server.RenewAccessTokenHeader)
	authRoutes.POST("/users/logout", server.logoutUser)

	authRoutes.POST("/users", server.createUser)
	authRoutes.GET("/users/:id", server.getUser)
	authRoutes.GET("/current_user", server.GetLoggedInUser)
	authRoutes.GET("/users", server.listUser)
	authRoutes.PUT("/users/:id", server.updateUser)
	authRoutes.DELETE("/users/:id", server.deleteUser)

	authRoutes.POST("/products", server.createProduct)
	router.GET("/product/:url", server.getProductByURL)
	router.GET("/products/:id", server.getProduct)
	router.GET("/products", server.listProduct)
	// ideally would be paginated as well but for now its good enough
	router.GET("/users/:id/products", server.listProductsByUser)
	authRoutes.PUT("/products/:id", server.updateProduct)
	authRoutes.DELETE("/products/:id", server.deleteProduct)

	authRoutes.POST("/categories", server.createCategory)
	router.GET("/categories/:id", server.getCategory)
	router.GET("/categories", server.listCategory)
	authRoutes.PUT("/categories/:id", server.updateCategory)
	authRoutes.DELETE("/categories/:id", server.deleteCategory)

	authRoutes.POST("/link_categories/:category_id/:product_id", server.associateCategoryWithProduct)
	authRoutes.POST("/link_categories/multiple/:product_id", server.associateMultipleCategoriesWithProduct)
	authRoutes.DELETE("/link_categories/:category_id/:product_id", server.disassociateCategoryWithProduct)
	authRoutes.DELETE("/link_categories/multiple/:product_id", server.disassociateMultipleCategoriesWithProduct)
	router.GET("/categories/by_product/:product_id", server.listProductCategories)

	authRoutes.POST("/clients", server.createClient)
	authRoutes.GET("/clients/:id", server.getClient)
	authRoutes.GET("/clients", server.listClient)
	authRoutes.PUT("/clients/:id", server.updateClient)
	authRoutes.DELETE("/clients/:id", server.deleteClient)

	authRoutes.POST("/sales", server.createSale)
	authRoutes.GET("/sales/:id", server.getSale)
	authRoutes.GET("/sales", server.listSale)
	authRoutes.GET("/sales/all", server.listAllSales)
	authRoutes.POST("/sales/by_date", server.GetSalesByDate)
	authRoutes.GET("/sales/by_client/:client_id", server.GetSalesByClientID)
	authRoutes.PUT("/sales/:id", server.updateSale)
	authRoutes.DELETE("/sales/:id", server.deleteSale)
	authRoutes.DELETE("/sales/delete", server.deleteSales)

	authRoutes.POST("/pdf/", server.createPdf)
	//authRoutes.GET("/pdf/", server.getPdf)

	authRoutes.POST("/images", server.createImage)
	router.GET("/images/:id", server.getImage)
	router.POST("/images-multiple", server.getImages)
	router.GET("/media/:year/:month/:filename", server.getImagePath)
	authRoutes.GET("/images", server.listImage)
	authRoutes.PUT("/images/:id", server.updateImage)
	authRoutes.DELETE("/images/:id", server.deleteImage)

	authRoutes.POST("/link_images/:image_id/:product_id", server.associateImageWithProduct)
	authRoutes.POST("/link_images/multiple/:product_id", server.associateMultipleImagesWithProduct)
	authRoutes.DELETE("/link_images/:image_id/:product_id", server.disassociateImageWithProduct)
	authRoutes.DELETE("/link_images/multiple/:product_id", server.disassociateMultipleImagesWithProduct)
	router.GET("/images/by_product/:product_id", server.listProductImages)
	authRoutes.PUT("/images/by_product/:product_id", server.editImageOrder)

	authRoutes.POST("/slider_images", server.CreateSliderImage)
	router.GET("/slider_images", server.ListSliderImages)
	authRoutes.POST("/slider_images/update", server.UpdateSliderImage)
	authRoutes.POST("/slider_images/update_by_image_id", server.UpdateSliderImageByImageId)
	authRoutes.POST("/slider_images/delete", server.DeleteSliderImages)
	authRoutes.POST("/slider_images/delete_by_image_id", server.DeleteSliderImagesByImageId)

	router.POST("/contact", server.HandleForm)

	server.router = router
}

// Start runs the HTTP server on a specific address.
func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
