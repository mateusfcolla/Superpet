package db

import (
	"context"
	"database/sql"
	"super-pet-delivery/util"
	"testing"

	"github.com/stretchr/testify/require"
)

func createRandomProduct(t *testing.T) Product {
	user := createRandomUser(t)
	arg := CreateProductParams{
		Name:        util.RandomFullName(),
		Description: util.RandomDescription(),
		UserID:      user.ID,
		Price:       0,
		Images:      []string{},
	}

	product, err := testQueries.CreateProduct(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, product)

	require.Equal(t, arg.Name, product.Name)
	require.Equal(t, arg.Description, product.Description)
	require.Equal(t, arg.UserID, product.UserID)

	require.NotZero(t, product.ID)
	return product
}

func TestCreateProduct(t *testing.T) {
	createRandomProduct(t)
}

func TestGetProduct(t *testing.T) {
	product1 := createRandomProduct(t)
	product2, err := testQueries.GetProduct(context.Background(), product1.ID)
	require.NoError(t, err)
	require.NotEmpty(t, product2)

	require.Equal(t, product1.ID, product2.ID)
	require.Equal(t, product1.Name, product2.Name)
	require.Equal(t, product1.Description, product2.Description)
	require.Equal(t, product1.UserID, product2.UserID)

}

func TestListProducts(t *testing.T) {
	for i := 0; i < 10; i++ {
		createRandomProduct(t)
	}

	arg := ListProductsParams{
		Limit:  5,
		Offset: 5,
	}

	products, err := testQueries.ListProducts(context.Background(), arg)
	require.NoError(t, err)
	require.Len(t, products, 5)

	for _, product := range products {
		require.NotEmpty(t, product)
	}
}

func TestListProductsByUser(t *testing.T) {
	product1 := createRandomProduct(t)

	product2, err := testQueries.ListProductsByUser(context.Background(), product1.UserID)
	require.NoError(t, err)
	require.NotEmpty(t, product2)

	require.Equal(t, product1.ID, product2[0].ID)
	require.Equal(t, product1.Name, product2[0].Name)
	require.Equal(t, product1.Description, product2[0].Description)
	require.Equal(t, product1.UserID, product2[0].UserID)

}

func TestListProductsByCategory(t *testing.T) {
	product1 := createRandomProduct(t)
	product2 := createRandomProduct(t)
	product3 := createRandomProduct(t)
	category := createRandomCategory(t)

	params1 := AssociateProductWithCategoryParams{
		ProductID:  product1.ID,
		CategoryID: category.ID,
	}
	params2 := AssociateProductWithCategoryParams{
		ProductID:  product2.ID,
		CategoryID: category.ID,
	}
	params3 := AssociateProductWithCategoryParams{
		ProductID:  product3.ID,
		CategoryID: category.ID,
	}

	associatedCat, err := testQueries.AssociateProductWithCategory(context.Background(), params1)
	require.NoError(t, err)
	require.NotEmpty(t, associatedCat)
	associatedCat2, err2 := testQueries.AssociateProductWithCategory(context.Background(), params2)
	require.NoError(t, err2)
	require.NotEmpty(t, associatedCat2)
	associatedCat3, err3 := testQueries.AssociateProductWithCategory(context.Background(), params3)
	require.NoError(t, err3)
	require.NotEmpty(t, associatedCat3)

	paramsList := ListProductsByCategoryParams{
		CategoryID: category.ID,
		Limit:      3,
		Offset:     0,
	}

	products, err := testQueries.ListProductsByCategory(context.Background(), paramsList)
	require.NoError(t, err)
	require.Len(t, products, 3)

}

func TestDisassociateProductFromCategory(t *testing.T) {
	product1 := createRandomProduct(t)
	category := createRandomCategory(t)

	params1 := AssociateProductWithCategoryParams{
		ProductID:  product1.ID,
		CategoryID: category.ID,
	}
	associatedCat, err := testQueries.AssociateProductWithCategory(context.Background(), params1)
	require.NoError(t, err)
	require.NotEmpty(t, associatedCat)

	paramsDisassociate := DisassociateProductFromCategoryParams{
		ProductID:  product1.ID,
		CategoryID: category.ID,
	}
	disassociateCat, err := testQueries.DisassociateProductFromCategory(context.Background(), paramsDisassociate)
	require.NoError(t, err)
	require.NotEmpty(t, disassociateCat)
}

func TestUpdateProduct(t *testing.T) {
	product1 := createRandomProduct(t)
	product2 := createRandomProduct(t)
	product3 := createRandomProduct(t)
	user := createRandomUser(t)

	// update name
	arg := UpdateProductParams{
		ID:          product1.ID,
		Name:        util.RandomFullName(),
		Description: product1.Description,
		UserID:      product1.UserID,
		Price:       product1.Price,
		Images:      product1.Images,
	}
	// update description
	arg2 := UpdateProductParams{
		ID:          product2.ID,
		Name:        product2.Name,
		Description: util.RandomDescription(),
		UserID:      product2.UserID,
		Price:       product2.Price,
		Images:      product2.Images,
	}
	// update userID
	arg3 := UpdateProductParams{
		ID:          product3.ID,
		Name:        product3.Name,
		Description: product3.Description,
		UserID:      user.ID,
		Price:       product3.Price,
		Images:      product3.Images,
	}

	// testing update name
	product1Alt, err := testQueries.UpdateProduct(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, product1Alt)

	require.Equal(t, product1.ID, product1Alt.ID)
	require.Equal(t, arg.Name, product1Alt.Name)
	require.Equal(t, product1.Description, product1Alt.Description)
	require.Equal(t, product1.UserID, product1Alt.UserID)
	t.Logf("Product1: %v", product1)
	t.Logf("updated Product1: %v", arg)

	// testing update description
	product2Alt, err := testQueries.UpdateProduct(context.Background(), arg2)
	require.NoError(t, err)
	require.NotEmpty(t, product2Alt)

	require.Equal(t, product2.ID, product2Alt.ID)
	require.Equal(t, product2.Name, product2Alt.Name)
	require.Equal(t, arg2.Description, product2Alt.Description)
	require.Equal(t, product2.UserID, product2Alt.UserID)
	t.Logf("Product2: %v", product2)
	t.Logf("updated Product2: %v", arg2)

	// testing update description
	product3Alt, err := testQueries.UpdateProduct(context.Background(), arg3)
	require.NoError(t, err)
	require.NotEmpty(t, product3Alt)

	require.Equal(t, product3.ID, product3Alt.ID)
	require.Equal(t, product3.Name, product3Alt.Name)
	require.Equal(t, product3.Description, product3Alt.Description)
	require.Equal(t, arg3.UserID, product3Alt.UserID)
	t.Logf("product3: %v", product3)
	t.Logf("New User ID: %v", user.ID)
	t.Logf("updated product3: %v", arg3)
}

// Test Delete Product
func TestDeleteProduct(t *testing.T) {
	product1 := createRandomProduct(t)
	err := testQueries.DeleteProduct(context.Background(), product1.ID)
	require.NoError(t, err)

	product2, err := testQueries.GetProduct(context.Background(), product1.ID)
	require.Error(t, err)
	require.EqualError(t, err, sql.ErrNoRows.Error())
	require.Empty(t, product2)
}
