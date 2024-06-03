package db

import (
	"context"
	"database/sql"
	"super-pet-delivery/util"
	"testing"

	"github.com/stretchr/testify/require"
)

func createRandomSale(t *testing.T) Sale {
	client1 := createRandomClient(t)
	arg := CreateSaleParams{
		ClientID:    client1.ID,
		Product:     util.RandomString(9),
		Price:       1000, // Set an appropriate price.
		Observation: util.RandomString(9),
	}

	sale, err := testQueries.CreateSale(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, sale)

	require.Equal(t, arg.Product, sale.Product)

	require.NotZero(t, sale.ID)
	return sale
}

func TestCreateSale(t *testing.T) {
	createRandomSale(t)
}

func TestGetSale(t *testing.T) {
	sale1 := createRandomSale(t)
	sale2, err := testQueries.GetSale(context.Background(), sale1.ID)
	require.NoError(t, err)
	require.NotEmpty(t, sale2)

	require.Equal(t, sale1.ID, sale2.ID)
	require.Equal(t, sale1.Product, sale2.Product)
}

func TestListSales(t *testing.T) {
	for i := 0; i < 10; i++ {
		createRandomSale(t)
	}

	arg := ListSalesParams{
		Limit:  5,
		Offset: 5,
	}

	sales, err := testQueries.ListSales(context.Background(), arg)
	require.NoError(t, err)
	require.Len(t, sales, 5)

	for _, sale := range sales {
		require.NotEmpty(t, sale)
	}
}

func TestUpdateSale(t *testing.T) {
	sale1 := createRandomSale(t)
	sale2 := createRandomSale(t)
	sale3 := createRandomSale(t)
	t.Logf("sale1: %v", sale1)

	arg := UpdateSaleParams{
		ID:          sale1.ID,
		ClientID:    sale1.ClientID,
		Product:     util.RandomString(9),
		Price:       1500, // Set an appropriate price.
		Observation: util.RandomString(9),
	}
	arg2 := UpdateSaleParams{
		ID:          sale2.ID,
		ClientID:    sale2.ClientID,
		Product:     sale2.Product,
		Price:       2000, // Set an appropriate price.
		Observation: util.RandomString(9),
	}
	arg3 := UpdateSaleParams{
		ID:          sale3.ID,
		ClientID:    sale3.ClientID,
		Product:     sale3.Product,
		Price:       sale3.Price,
		Observation: util.RandomString(9),
	}
	t.Logf("updated sale1: %v", arg)

	// testing update product
	sale1Alt, err := testQueries.UpdateSale(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, sale1Alt)

	require.Equal(t, sale1.ID, sale1Alt.ID)
	require.Equal(t, arg.Product, sale1Alt.Product)

	// testing update price
	sale2Alt, err := testQueries.UpdateSale(context.Background(), arg2)
	require.NoError(t, err)
	require.NotEmpty(t, sale2Alt)

	require.Equal(t, sale2.ID, sale2Alt.ID)
	require.Equal(t, arg2.Price, sale2Alt.Price)

	// testing update observation
	sale3Alt, err := testQueries.UpdateSale(context.Background(), arg3)
	require.NoError(t, err)
	require.NotEmpty(t, sale3Alt)

	require.Equal(t, sale3.ID, sale3Alt.ID)
	require.Equal(t, arg3.Observation, sale3Alt.Observation)
}

func TestDeleteSale(t *testing.T) {
	sale1 := createRandomSale(t)
	err := testQueries.DeleteSale(context.Background(), sale1.ID)
	require.NoError(t, err)

	sale2, err := testQueries.GetSale(context.Background(), sale1.ID)
	require.Error(t, err)
	require.EqualError(t, err, sql.ErrNoRows.Error())
	require.Empty(t, sale2)
}
