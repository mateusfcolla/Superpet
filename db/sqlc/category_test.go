package db

import (
	"context"
	"database/sql"
	"super-pet-delivery/util"
	"testing"

	"github.com/stretchr/testify/require"
)

func createRandomCategory(t *testing.T) Category {
	arg := CreateCategoryParams{
		Name:        util.RandomFullName(),
		Description: util.RandomDescription(),
	}

	category, err := testQueries.CreateCategory(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, category)

	require.Equal(t, arg.Name, category.Name)
	require.Equal(t, arg.Description, category.Description)

	require.NotZero(t, category.ID)
	return category
}

func TestCreateCategory(t *testing.T) {
	createRandomCategory(t)
}

func TestGetCategory(t *testing.T) {
	category1 := createRandomCategory(t)
	category2, err := testQueries.GetCategory(context.Background(), category1.ID)
	require.NoError(t, err)
	require.NotEmpty(t, category2)

	require.Equal(t, category1.ID, category2.ID)
	require.Equal(t, category1.Name, category2.Name)
	require.Equal(t, category1.Description, category2.Description)
}

func TestListCategories(t *testing.T) {
	for i := 0; i < 10; i++ {
		createRandomCategory(t)
	}

	arg := ListCategoriesParams{
		Limit:  5,
		Offset: 5,
	}

	categories, err := testQueries.ListCategories(context.Background(), arg)
	require.NoError(t, err)
	require.Len(t, categories, 5)

	for _, category := range categories {
		require.NotEmpty(t, category)
	}
}

func TestAssociateProductWithCategory(t *testing.T) {
	product := createRandomProduct(t)
	category := createRandomCategory(t)

	arg := AssociateProductWithCategoryParams{
		ProductID:  product.ID,
		CategoryID: category.ID,
	}

	associatedCategory, err := testQueries.AssociateProductWithCategory(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, associatedCategory)
}

func TestListCategoriesByProduct(t *testing.T) {
	product := createRandomProduct(t)
	category1 := createRandomCategory(t)
	category2 := createRandomCategory(t)
	category3 := createRandomCategory(t)

	arg1 := AssociateProductWithCategoryParams{
		ProductID:  product.ID,
		CategoryID: category1.ID,
	}
	arg2 := AssociateProductWithCategoryParams{
		ProductID:  product.ID,
		CategoryID: category2.ID,
	}
	arg3 := AssociateProductWithCategoryParams{
		ProductID:  product.ID,
		CategoryID: category3.ID,
	}

	associatedCategory1, err1 := testQueries.AssociateProductWithCategory(context.Background(), arg1)
	require.NoError(t, err1)
	require.NotEmpty(t, associatedCategory1)
	associatedCategory2, err2 := testQueries.AssociateProductWithCategory(context.Background(), arg2)
	require.NoError(t, err2)
	require.NotEmpty(t, associatedCategory2)
	associatedCategory3, err3 := testQueries.AssociateProductWithCategory(context.Background(), arg3)
	require.NoError(t, err3)
	require.NotEmpty(t, associatedCategory3)

	categories, err := testQueries.ListCategoriesByProduct(context.Background(), product.ID)
	require.NoError(t, err)
	require.Len(t, categories, 3)

	for _, category := range categories {
		require.NotEmpty(t, category)
	}
}

func TestUpdateCategory(t *testing.T) {
	category1 := createRandomCategory(t)

	// Update the category's name and description
	arg := UpdateCategoryParams{
		ID:          category1.ID,
		Name:        util.RandomFullName(),
		Description: util.RandomDescription(),
	}

	updatedCategory, err := testQueries.UpdateCategory(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, updatedCategory)

	// Verify that the category has been updated with the new values
	require.Equal(t, category1.ID, updatedCategory.ID)
	require.Equal(t, arg.Name, updatedCategory.Name)
	require.Equal(t, arg.Description, updatedCategory.Description)
}

func TestDeleteCategory(t *testing.T) {
	category1 := createRandomCategory(t)
	err := testQueries.DeleteCategory(context.Background(), category1.ID)
	require.NoError(t, err)

	// Attempt to retrieve the deleted category
	_, err = testQueries.GetCategory(context.Background(), category1.ID)
	require.Error(t, err)
	require.EqualError(t, err, sql.ErrNoRows.Error())
}
