package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	mockdb "super-pet-delivery/db/mock"
	db "super-pet-delivery/db/sqlc"
	"super-pet-delivery/token"
	"super-pet-delivery/util"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.uber.org/mock/gomock"
)

func TestCreateProductAPI(t *testing.T) {
	// Generate a random product for testing
	product := randomProduct()

	// Create a request body with product data
	requestProduct := createProductRequest{
		Name:        product.Name,
		Description: product.Description,
		UserID:      product.UserID,
	}

	testCases := []struct {
		name           string
		requestProduct createProductRequest
		setupAuth      func(t *testing.T, request *http.Request, tokenMkaer token.Maker)
		buildStubs     func(store *mockdb.MockStore)
		checkResponse  func(t *testing.T, recorder *httptest.ResponseRecorder)
	}{
		{
			name:           "OK",
			requestProduct: requestProduct,
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, authorizationTypeBearer, "username", time.Minute)
			},
			buildStubs: func(store *mockdb.MockStore) {
				// Define expectations for the CreateProduct function in your mock store.
				store.EXPECT().CreateProduct(gomock.Any(), gomock.Any()).Times(1).Return(product, nil)
			},
			checkResponse: func(t *testing.T, recorder *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusOK, recorder.Code)
				requireBodyMatchProduct(t, recorder.Body, product)
			},
		},
	}

	for i := range testCases {
		tc := testCases[i]

		t.Run(tc.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			store := mockdb.NewMockStore(ctrl)
			tc.buildStubs(store)

			server := newTestServer(t, store)
			recorder := httptest.NewRecorder()

			// Marshal the request body into JSON
			requestBody, err := json.Marshal(tc.requestProduct)
			require.NoError(t, err)

			// Create an HTTP request with the JSON body
			request, err := http.NewRequest(http.MethodPost, "/products", bytes.NewReader(requestBody))
			require.NoError(t, err)

			// Serve the request and check the response
			tc.setupAuth(t, request, server.tokenMaker)
			server.router.ServeHTTP(recorder, request)
			tc.checkResponse(t, recorder)
		})
	}
}

// randomProduct generates a random product for testing
func randomProduct() db.Product {
	return db.Product{
		ID:          util.RandomInt(1, 1000),
		Name:        util.RandomString(10),
		Description: util.RandomString(50),
		UserID:      util.RandomInt(1, 1000),
	}
}

// requireBodyMatchProduct checks if the response body matches the expected product
func requireBodyMatchProduct(t *testing.T, body *bytes.Buffer, product db.Product) {
	data, err := io.ReadAll(body)
	require.NoError(t, err)

	var gotProduct db.Product
	err = json.Unmarshal(data, &gotProduct)
	require.NoError(t, err)
	require.Equal(t, product, gotProduct)
}

// TestGetProductAPI tests the GetProduct API endpoint.
func TestGetProductAPI(t *testing.T) {
	// Generate a random product for testing.
	product := randomProduct()

	testCases := []struct {
		name          string
		productID     int64
		buildStubs    func(store *mockdb.MockStore)
		checkResponse func(t *testing.T, recorder *httptest.ResponseRecorder)
	}{
		{
			name:      "OK",
			productID: product.ID, // Assuming that "randomProduct" generates a valid product with an ID.
			buildStubs: func(store *mockdb.MockStore) {
				// Define expectations for the GetProduct function in your mock store.
				store.EXPECT().GetProduct(gomock.Any(), product.ID).Times(1).Return(product, nil)
			},
			checkResponse: func(t *testing.T, recorder *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusOK, recorder.Code)
				requireBodyMatchProduct(t, recorder.Body, product)
			},
		},
	}

	for i := range testCases {
		tc := testCases[i]

		t.Run(tc.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			store := mockdb.NewMockStore(ctrl)
			tc.buildStubs(store)

			server := newTestServer(t, store)
			recorder := httptest.NewRecorder()

			// Define the request URI with the product ID
			requestURI := fmt.Sprintf("/products/%d", tc.productID)

			// Create an HTTP request with the specified URI
			request, err := http.NewRequest(http.MethodGet, requestURI, nil)
			require.NoError(t, err)

			// Serve the request and check the response
			server.router.ServeHTTP(recorder, request)
			tc.checkResponse(t, recorder)
		})
	}
}

func TestUpdateProductAPI(t *testing.T) {
	// Generate a random product for testing.
	product := randomProduct()

	// Create an update request with modified data.
	updateRequest := updateProductRequest{
		Name:        "Updated Product Name",
		Description: "Updated Product Description",
		UserID:      123,
	}

	testCases := []struct {
		name          string
		productID     int64
		requestBody   interface{}
		setupAuth     func(t *testing.T, request *http.Request, tokenMkaer token.Maker)
		buildStubs    func(store *mockdb.MockStore)
		checkResponse func(t *testing.T, recorder *httptest.ResponseRecorder)
	}{
		{
			name:        "OK",
			productID:   product.ID,
			requestBody: updateRequest,
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, authorizationTypeBearer, "username", time.Minute)
			},
			buildStubs: func(store *mockdb.MockStore) {
				// Define expectations for the GetProduct and UpdateProduct functions in your mock store.
				store.EXPECT().GetProduct(gomock.Any(), product.ID).Times(1).Return(product, nil)
				store.EXPECT().UpdateProduct(gomock.Any(), gomock.Any()).Times(1).Return(product, nil)
			},
			checkResponse: func(t *testing.T, recorder *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusOK, recorder.Code)
				requireBodyMatchProduct(t, recorder.Body, product)
			},
		},
		// Add more test cases for different scenarios as needed.
	}

	for i := range testCases {
		tc := testCases[i]

		t.Run(tc.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			store := mockdb.NewMockStore(ctrl)
			tc.buildStubs(store)

			server := newTestServer(t, store)
			recorder := httptest.NewRecorder()

			// Define the request URI with the product ID
			requestURI := fmt.Sprintf("/products/%d", tc.productID)

			// Marshal the request body into JSON.
			requestBody, err := json.Marshal(tc.requestBody)
			require.NoError(t, err)

			// Create an HTTP request with the specified URI and JSON body.
			request, err := http.NewRequest(http.MethodPut, requestURI, bytes.NewReader(requestBody))
			require.NoError(t, err)

			// Serve the request and check the response.
			tc.setupAuth(t, request, server.tokenMaker)
			server.router.ServeHTTP(recorder, request)
			tc.checkResponse(t, recorder)
		})
	}
}

func TestDeleteProductAPI_OK(t *testing.T) {
	// Generate a random product for testing.
	product := randomProduct()

	testCases := []struct {
		name          string
		productID     int64
		setupAuth     func(t *testing.T, request *http.Request, tokenMkaer token.Maker)
		buildStubs    func(store *mockdb.MockStore)
		checkResponse func(t *testing.T, recorder *httptest.ResponseRecorder)
	}{
		{
			name:      "OK",
			productID: product.ID,
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, authorizationTypeBearer, "username", time.Minute)
			},
			buildStubs: func(store *mockdb.MockStore) {
				// Define expectations for the DeleteProduct function in your mock store.
				store.EXPECT().DeleteProduct(gomock.Any(), product.ID).Times(1).Return(nil)
			},
			checkResponse: func(t *testing.T, recorder *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusOK, recorder.Code)
				require.Equal(t, "Product deleted successfully", strings.Trim(recorder.Body.String(), "\n\""))
			},
		},
	}

	for i := range testCases {
		tc := testCases[i]

		t.Run(tc.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			store := mockdb.NewMockStore(ctrl)
			tc.buildStubs(store)

			server := newTestServer(t, store)
			recorder := httptest.NewRecorder()

			// Define the request URI with the product ID
			requestURI := fmt.Sprintf("/products/%d", tc.productID)

			// Create an HTTP request with the specified URI.
			request, err := http.NewRequest(http.MethodDelete, requestURI, nil)
			require.NoError(t, err)

			// Serve the request and check the response.
			tc.setupAuth(t, request, server.tokenMaker)
			server.router.ServeHTTP(recorder, request)
			tc.checkResponse(t, recorder)
		})
	}
}
