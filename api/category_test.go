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

func TestCreateCategoryAPI(t *testing.T) {
	// Generate a random category for testing
	category := randomCategory()

	// Create a request body with category data
	requestCategory := createCategoryRequest{
		Name:        category.Name,
		Description: category.Description,
	}

	testCases := []struct {
		name            string
		requestCategory createCategoryRequest
		setupAuth       func(t *testing.T, request *http.Request, tokenMkaer token.Maker)
		buildStubs      func(store *mockdb.MockStore)
		checkResponse   func(t *testing.T, recorder *httptest.ResponseRecorder)
	}{
		{
			name:            "OK",
			requestCategory: requestCategory,
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, authorizationTypeBearer, "username", time.Minute)
			},
			buildStubs: func(store *mockdb.MockStore) {
				// Define expectations for the CreateCategory function in your mock store.
				store.EXPECT().CreateCategory(gomock.Any(), gomock.Any()).Times(1).Return(category, nil)
			},
			checkResponse: func(t *testing.T, recorder *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusOK, recorder.Code)
				requireBodyMatchCategory(t, recorder.Body, category)
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
			requestBody, err := json.Marshal(tc.requestCategory)
			require.NoError(t, err)

			// Create an HTTP request with the JSON body
			request, err := http.NewRequest(http.MethodPost, "/categories", bytes.NewReader(requestBody))
			require.NoError(t, err)

			// Serve the request and check the response
			tc.setupAuth(t, request, server.tokenMaker)
			server.router.ServeHTTP(recorder, request)
			tc.checkResponse(t, recorder)
		})
	}
}

// randomCategory generates a random category for testing
func randomCategory() db.Category {
	return db.Category{
		ID:          util.RandomInt(1, 1000),
		Name:        util.RandomString(10),
		Description: util.RandomString(50),
	}
}

// requireBodyMatchCategory checks if the response body matches the expected category
func requireBodyMatchCategory(t *testing.T, body *bytes.Buffer, category db.Category) {
	data, err := io.ReadAll(body)
	require.NoError(t, err)

	var gotCategory db.Category
	err = json.Unmarshal(data, &gotCategory)
	require.NoError(t, err)
	require.Equal(t, category, gotCategory)
}

// TestGetCategoryAPI tests the GetCategory API endpoint.
func TestGetCategoryAPI(t *testing.T) {
	// Generate a random category for testing.
	category := randomCategory()

	testCases := []struct {
		name          string
		categoryID    int64
		setupAuth     func(t *testing.T, request *http.Request, tokenMkaer token.Maker)
		buildStubs    func(store *mockdb.MockStore)
		checkResponse func(t *testing.T, recorder *httptest.ResponseRecorder)
	}{
		{
			name:       "OK",
			categoryID: category.ID, // Assuming that "randomCategory" generates a valid category with an ID.
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, authorizationTypeBearer, "username", time.Minute)
			},
			buildStubs: func(store *mockdb.MockStore) {
				// Define expectations for the GetCategory function in your mock store.
				store.EXPECT().GetCategory(gomock.Any(), category.ID).Times(1).Return(category, nil)
			},
			checkResponse: func(t *testing.T, recorder *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusOK, recorder.Code)
				requireBodyMatchCategory(t, recorder.Body, category)
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

			// Define the request URI with the category ID
			requestURI := fmt.Sprintf("/categories/%d", tc.categoryID)

			// Create an HTTP request with the specified URI
			request, err := http.NewRequest(http.MethodGet, requestURI, nil)
			require.NoError(t, err)

			// Serve the request and check the response
			tc.setupAuth(t, request, server.tokenMaker)
			server.router.ServeHTTP(recorder, request)
			tc.checkResponse(t, recorder)
		})
	}
}

func TestUpdateCategoryAPI(t *testing.T) {
	// Generate a random category for testing.
	category := randomCategory()

	// Create an update request with modified data.
	updateRequest := updateCategoryRequest{
		Name:        "Updated Category Name",
		Description: "Updated Category Description",
	}

	testCases := []struct {
		name          string
		categoryID    int64
		requestBody   interface{}
		setupAuth     func(t *testing.T, request *http.Request, tokenMkaer token.Maker)
		buildStubs    func(store *mockdb.MockStore)
		checkResponse func(t *testing.T, recorder *httptest.ResponseRecorder)
	}{
		{
			name:        "OK",
			categoryID:  category.ID,
			requestBody: updateRequest,
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, authorizationTypeBearer, "username", time.Minute)
			},
			buildStubs: func(store *mockdb.MockStore) {
				// Define expectations for the GetCategory and UpdateCategory functions in your mock store.
				store.EXPECT().GetCategory(gomock.Any(), category.ID).Times(1).Return(category, nil)
				store.EXPECT().UpdateCategory(gomock.Any(), gomock.Any()).Times(1).Return(category, nil)
			},
			checkResponse: func(t *testing.T, recorder *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusOK, recorder.Code)
				requireBodyMatchCategory(t, recorder.Body, category)
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

			// Define the request URI with the category ID
			requestURI := fmt.Sprintf("/categories/%d", tc.categoryID)

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

func TestDeleteCategoryAPI_OK(t *testing.T) {
	// Generate a random category for testing.
	category := randomCategory()

	testCases := []struct {
		name          string
		categoryID    int64
		setupAuth     func(t *testing.T, request *http.Request, tokenMkaer token.Maker)
		buildStubs    func(store *mockdb.MockStore)
		checkResponse func(t *testing.T, recorder *httptest.ResponseRecorder)
	}{
		{
			name:       "OK",
			categoryID: category.ID,
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, authorizationTypeBearer, "username", time.Minute)
			},
			buildStubs: func(store *mockdb.MockStore) {
				// Define expectations for the DeleteCategory function in your mock store.
				store.EXPECT().DeleteCategory(gomock.Any(), category.ID).Times(1).Return(nil)
			},
			checkResponse: func(t *testing.T, recorder *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusOK, recorder.Code)
				require.Equal(t, "Category deleted successfully", strings.Trim(recorder.Body.String(), "\n\""))
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

			// Define the request URI with the category ID
			requestURI := fmt.Sprintf("/categories/%d", tc.categoryID)

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
