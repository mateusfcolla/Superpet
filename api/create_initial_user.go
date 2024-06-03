package api

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	db "super-pet-delivery/db/sqlc"
	"super-pet-delivery/util"
)

func (server *Server) createInitialUser(store db.Store) error {
	fmt.Println("Checking if there is an Initial user")
	user, err := store.GetUser(context.Background(), 1)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if user.ID != 0 {
		fmt.Println("Initial user already exists, jumping to next task...")
		return nil
	}

	hashedPassword, err := util.HashPassword("123456")
	if err != nil {
		return err
	}
	initialUser := db.CreateUserParams{
		Username:       "luan",
		FullName:       "luankds",
		Email:          "luankds@gmail.com",
		HashedPassword: hashedPassword,
		Role:           "Administrator",
	}

	_, err = store.CreateUser(context.Background(), initialUser)
	if err != nil {
		fmt.Println("There wan an error in creating the initial user")
		return err
	}
	fmt.Println("initial user created successfully")
	return nil
}

func (server *Server) createDummyData(store db.Store) error {

	fmt.Println("Checking for existing clients...")

	argClients := db.ListClientsParams{
		Limit:  10,
		Offset: 1,
	}

	clients, err := store.ListClients(context.Background(), argClients)
	if err != nil {
		fmt.Println("There was an error fetching clients")
		return err
	}

	// If there are clients, don't create dummy data
	if len(clients) > 0 {
		fmt.Println("Clients exist, skipping dummy data creation")
		return nil
	}
	fmt.Println("Checking for existing sales...")

	arg := db.ListSalesParams{
		Limit:  10,
		Offset: 1,
	}

	sales, err := store.ListSales(context.Background(), arg)
	if err != nil {
		fmt.Println("There was an error fetching sales")
		return err
	}

	// If there are sales, don't create dummy data
	if len(sales) > 0 {
		fmt.Println("Sales exist, skipping dummy data creation")
		return nil
	}

	fmt.Println("No sales or clients found, creating dummy data...")
	fmt.Println("Creating dummy data...")

	// List of names to use for clients and pets
	clientNames := []string{"John", "Jane", "Bob", "Alice", "Charlie", "Eve", "Frank", "Grace", "Harry", "Ivy"}
	petNames := []string{"Buddy", "Bella", "Charlie", "Lucy", "Max", "Luna", "Rocky", "Sadie", "Zeus", "Daisy"}
	petBreeds := []string{"Labrador", "Bulldog", "Beagle", "Poodle", "Rottweiler", "Yorkshire Terrier", "Boxer", "Dachshund", "Siberian Husky", "Pomeranian"}
	clientProducts := []string{"Dog Food", "Cat Food", "Bird Food", "Fish Food", "Dog Toy", "Cat Toy", "Bird Cage", "Fish Tank", "Dog Leash", "Cat Litter"}
	cities := []string{"New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"}

	// Create dummy clients
	for i := 1; i <= 20; i++ {
		client := db.CreateClientParams{
			FullName:            clientNames[i%len(clientNames)] + " " + strconv.Itoa(i),
			PhoneWhatsapp:       "1234567890",
			PhoneLine:           "0987654321",
			PetName:             petNames[i%len(petNames)],
			PetBreed:            petBreeds[i%len(petBreeds)],
			AddressStreet:       "Street " + strconv.Itoa(i),
			AddressCity:         cities[i%len(cities)],
			AddressNumber:       strconv.Itoa(i),
			AddressNeighborhood: "Neighborhood " + strconv.Itoa(i),
			AddressReference:    "Reference " + strconv.Itoa(i),
		}

		createdClient, err := store.CreateClient(context.Background(), client)
		if err != nil {
			fmt.Println("There was an error creating a dummy client")
			return err
		}

		// Create dummy sales for each client
		for j := 1; j <= 20; j++ {
			sale := db.CreateSaleParams{
				ClientID:    createdClient.ID,
				ClientName:  createdClient.FullName,
				Product:     clientProducts[j%len(clientProducts)],
				Price:       float64(j * 10),
				Observation: "Observation " + strconv.Itoa(j),
			}

			_, err := store.CreateSale(context.Background(), sale)
			if err != nil {
				fmt.Println("There was an error creating a dummy sale")
				return err
			}
		}
	}

	fmt.Println("Dummy data created successfully")
	return nil
}

func (server *Server) createDummyProducts(store db.Store) error {
	fmt.Println("Checking for existing products...")

	arg := db.ListProductsParams{
		Limit:  10,
		Offset: 1,
	}

	products, err := store.ListProducts(context.Background(), arg)
	if err != nil {
		fmt.Println("There was an error fetching products")
		return err
	}

	// If there are products, don't create dummy data
	if len(products) > 0 {
		fmt.Println("Products exist, skipping dummy data creation")
		return nil
	}

	fmt.Println("No products found, creating dummy data...")
	fmt.Println("Creating dummy data...")

	// Create dummy products
	for i := 1; i <= 20; i++ {
		price := float64(i * 10)
		product := db.CreateProductParams{
			Name:        "Product " + strconv.Itoa(i),
			Description: "Description " + strconv.Itoa(i),
			UserID:      1,
			Price:       price,
			Images:      []string{"https://picsum.photos/200/300?random=" + strconv.Itoa(i)},
		}

		_, err := store.CreateProduct(context.Background(), product)
		if err != nil {
			fmt.Println("There was an error creating a dummy product")
			return err
		}
	}

	fmt.Println("Dummy data created successfully")
	return nil
}
