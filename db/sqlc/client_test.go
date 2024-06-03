package db

import (
	"context"
	"database/sql"
	"super-pet-delivery/util"
	"testing"

	"github.com/stretchr/testify/require"
)

func createRandomClient(t *testing.T) Client {
	arg := CreateClientParams{
		FullName:            util.RandomFullName(),
		PhoneWhatsapp:       util.RandomString(9),
		PhoneLine:           util.RandomString(9),
		PetName:             util.RandomString(9),
		PetBreed:            util.RandomString(9),
		AddressStreet:       util.RandomString(9),
		AddressNumber:       util.RandomString(9),
		AddressNeighborhood: util.RandomString(9),
		AddressReference:    util.RandomString(9),
	}

	client, err := testQueries.CreateClient(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, client)

	require.Equal(t, arg.FullName, client.FullName)

	require.NotZero(t, client.ID)
	return client
}

func TestCreateClient(t *testing.T) {
	createRandomClient(t)
}

func TestGetClient(t *testing.T) {
	client1 := createRandomClient(t)
	client2, err := testQueries.GetClient(context.Background(), client1.ID)
	require.NoError(t, err)
	require.NotEmpty(t, client2)

	require.Equal(t, client1.ID, client2.ID)
	require.Equal(t, client1.FullName, client2.FullName)
}

func TestListClients(t *testing.T) {
	for i := 0; i < 10; i++ {
		createRandomClient(t)
	}

	arg := ListClientsParams{
		Limit:  5,
		Offset: 5,
	}

	clients, err := testQueries.ListClients(context.Background(), arg)
	require.NoError(t, err)
	require.Len(t, clients, 5)

	for _, client := range clients {
		require.NotEmpty(t, client)
	}
}

func TestUpdateClient(t *testing.T) {
	client1 := createRandomClient(t)
	client2 := createRandomClient(t)
	client3 := createRandomClient(t)
	t.Logf("client1: %v", client1)

	arg := UpdateClientParams{
		ID:                  client1.ID,
		FullName:            util.RandomFullName(),
		PhoneWhatsapp:       client1.PhoneWhatsapp,
		PhoneLine:           client1.PhoneLine,
		PetName:             client1.PetName,
		PetBreed:            client1.PetBreed,
		AddressStreet:       client1.AddressStreet,
		AddressNumber:       client1.AddressNumber,
		AddressNeighborhood: client1.AddressNeighborhood,
		AddressReference:    client1.AddressReference,
	}
	arg2 := UpdateClientParams{
		ID:                  client2.ID,
		FullName:            client2.FullName,
		PhoneWhatsapp:       util.RandomString(9),
		PhoneLine:           client2.PhoneLine,
		PetName:             client2.PetName,
		PetBreed:            client2.PetBreed,
		AddressStreet:       client2.AddressStreet,
		AddressNumber:       client2.AddressNumber,
		AddressNeighborhood: client2.AddressNeighborhood,
		AddressReference:    client2.AddressReference,
	}
	arg3 := UpdateClientParams{
		ID:                  client3.ID,
		FullName:            client3.FullName,
		PhoneWhatsapp:       client3.PhoneWhatsapp,
		PhoneLine:           client3.PhoneLine,
		PetName:             client3.PetName,
		PetBreed:            client3.PetBreed,
		AddressStreet:       util.RandomString(9),
		AddressNumber:       util.RandomString(9),
		AddressNeighborhood: util.RandomString(9),
		AddressReference:    util.RandomString(9),
	}
	t.Logf("updated client1: %v", arg)

	// testing update full name
	client1Alt, err := testQueries.UpdateClient(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, client1Alt)

	require.Equal(t, client1.ID, client1Alt.ID)
	require.Equal(t, arg.FullName, client1Alt.FullName)

	// testing update phone number
	client2Alt, err := testQueries.UpdateClient(context.Background(), arg2)
	require.NoError(t, err)
	require.NotEmpty(t, client2Alt)

	require.Equal(t, client2.ID, client2Alt.ID)
	require.Equal(t, arg2.PhoneWhatsapp, client2Alt.PhoneWhatsapp)

	// testing update address
	client3Alt, err := testQueries.UpdateClient(context.Background(), arg3)
	require.NoError(t, err)
	require.NotEmpty(t, client3Alt)

	require.Equal(t, client3.ID, client3Alt.ID)
	require.Equal(t, arg3.AddressStreet, client3Alt.AddressStreet)
}

func TestDeleteClient(t *testing.T) {
	client1 := createRandomClient(t)
	err := testQueries.DeleteClient(context.Background(), client1.ID)
	require.NoError(t, err)

	client2, err := testQueries.GetClient(context.Background(), client1.ID)
	require.Error(t, err)
	require.EqualError(t, err, sql.ErrNoRows.Error())
	require.Empty(t, client2)
}
