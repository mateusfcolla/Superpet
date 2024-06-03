package db

import (
	"context"
	"database/sql"
	"super-pet-delivery/util"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func createRandomUser(t *testing.T) User {
	hashedPassword, err := util.HashPassword(util.RandomString(6))
	require.NoError(t, err)

	arg := CreateUserParams{
		Username:       util.RandomUsername(),
		FullName:       util.RandomFullName(),
		Email:          util.RandomEmail(),
		HashedPassword: hashedPassword,
		Role:           "User",
	}

	user, err := testQueries.CreateUser(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, user)

	require.Equal(t, arg.Username, user.Username)
	require.Equal(t, arg.FullName, user.FullName)
	require.Equal(t, arg.Email, user.Email)
	require.Equal(t, arg.HashedPassword, user.HashedPassword)

	require.NotZero(t, user.ID)
	//default value in passwod changed at is zero
	require.True(t, user.PasswordChangedAt.IsZero())
	require.NotZero(t, user.CreatedAt)

	return user
}

func TestCreateUser(t *testing.T) {
	createRandomUser(t)
}

func TestGetUser(t *testing.T) {
	user1 := createRandomUser(t)
	user2, err := testQueries.GetUser(context.Background(), user1.ID)
	require.NoError(t, err)
	require.NotEmpty(t, user2)

	require.Equal(t, user1.ID, user2.ID)
	require.Equal(t, user1.Username, user2.Username)
	require.Equal(t, user1.FullName, user2.FullName)
	require.Equal(t, user1.Email, user2.Email)
	require.Equal(t, user1.HashedPassword, user2.HashedPassword)
	require.WithinDuration(t, user1.PasswordChangedAt, user2.PasswordChangedAt, time.Second)
	require.WithinDuration(t, user1.CreatedAt, user2.CreatedAt, time.Second)

}

func TestListUsers(t *testing.T) {
	for i := 0; i < 10; i++ {
		createRandomUser(t)
	}

	arg := ListUsersParams{
		Limit:  5,
		Offset: 5,
	}

	users, err := testQueries.ListUsers(context.Background(), arg)
	require.NoError(t, err)
	require.Len(t, users, 5)

	for _, user := range users {
		require.NotEmpty(t, user)
	}
}

func TestUpdateUser(t *testing.T) {
	user1 := createRandomUser(t)
	user2 := createRandomUser(t)
	user3 := createRandomUser(t)
	t.Logf("user1: %v", user1)

	arg := UpdateUserParams{
		ID:       user1.ID,
		Username: util.RandomUsername(),
		FullName: user1.FullName,
		Email:    user1.Email,
	}
	arg2 := UpdateUserParams{
		ID:       user2.ID,
		Username: user2.Username,
		FullName: util.RandomFullName(),
		Email:    user2.Email,
	}
	arg3 := UpdateUserParams{
		ID:       user3.ID,
		Username: user3.Username,
		FullName: user3.FullName,
		Email:    util.RandomEmail(),
	}
	t.Logf("updated user1: %v", arg)

	// testing update username
	user1Alt, err := testQueries.UpdateUser(context.Background(), arg)
	require.NoError(t, err)
	require.NotEmpty(t, user1Alt)

	require.Equal(t, user1.ID, user1Alt.ID)
	require.Equal(t, arg.Username, user1Alt.Username)
	require.Equal(t, user1.FullName, user1Alt.FullName)
	require.Equal(t, user1.Email, user1Alt.Email)

	// testing update fullname
	user2Alt, err := testQueries.UpdateUser(context.Background(), arg2)
	require.NoError(t, err)
	require.NotEmpty(t, user2Alt)

	require.Equal(t, user2.ID, user2Alt.ID)
	require.Equal(t, user2.Username, user2Alt.Username)
	require.Equal(t, arg2.FullName, user2Alt.FullName)
	require.Equal(t, user2.Email, user2Alt.Email)

	// testing update email
	user3Alt, err := testQueries.UpdateUser(context.Background(), arg3)
	require.NoError(t, err)
	require.NotEmpty(t, user3Alt)

	require.Equal(t, user3.ID, user3Alt.ID)
	require.Equal(t, user3.Username, user3Alt.Username)
	require.Equal(t, user3.FullName, user3Alt.FullName)
	require.Equal(t, arg3.Email, user3Alt.Email)
}

// TODO handle delete user on the product ID size
func TestDeleteUser(t *testing.T) {
	user1 := createRandomUser(t)
	err := testQueries.DeleteUser(context.Background(), user1.ID)
	require.NoError(t, err)

	user2, err := testQueries.GetUser(context.Background(), user1.ID)
	require.Error(t, err)
	require.EqualError(t, err, sql.ErrNoRows.Error())
	require.Empty(t, user2)
}
