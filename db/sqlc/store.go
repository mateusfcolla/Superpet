package db

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/lib/pq"
)

type Store interface {
	Querier
}

type SortableStore interface {
	Store
	ListClientsSorted(ctx context.Context, arg ListClientsParams, sortField string, sortDirection string) ([]Client, error)
	SearchClients(ctx context.Context, search string, pageId int, pageSize int, sortField string, sortDirection string) ([]Client, error)
	ListSalesSorted(ctx context.Context, arg ListSalesParams, sortField string, sortDirection string) ([]Sale, error)
	SearchSales(ctx context.Context, search string, pageId int, pageSize int, sortField string, sortDirection string) ([]Sale, error)
	ListProductsSorted(ctx context.Context, arg ListProductsParams, sortField string, sortDirection string) ([]Product, int64, error)
	SearchProducts(ctx context.Context, search string, pageId int, pageSize int, sortField string, sortDirection string) ([]Product, int64, error)
	FilterProducts(ctx context.Context, categoryIds []int64, pageId int, pageSize int, sortField string, sortDirection string, search string) ([]Product, int64, error)
	ListImagesSorted(ctx context.Context, arg ListImagesParams, sortField string, sortDirection string) ([]Image, error)
	SearchImages(ctx context.Context, search string, pageId int, pageSize int, sortField string, sortDirection string) ([]Image, error)
}

// Store provides all functions to execute db queries and transaction
type SQLStore struct {
	db *sql.DB
	*Queries
}
type SortableSQLStore struct {
	*SQLStore
}

// NewStore creates a new store
func NewStore(db *sql.DB) Store {
	return &SQLStore{
		db:      db,
		Queries: New(db),
	}
}

func NewSortableStore(db *sql.DB) SortableStore {
	return &SortableSQLStore{
		SQLStore: NewStore(db).(*SQLStore),
	}
}

func (store *SortableSQLStore) ListClientsSorted(ctx context.Context, arg ListClientsParams, sortField string, sortDirection string) ([]Client, error) {
	// Define a map of valid sort fields and directions
	validSortFields := map[string]bool{"full_name": true, "pet_name": true, "phone_whatsapp": true}
	validSortDirections := map[string]bool{"asc": true, "desc": true}

	// Validate the sort field and direction
	if !validSortFields[sortField] {
		return nil, fmt.Errorf("invalid sort field: %s", sortField)
	}
	if !validSortDirections[sortDirection] {
		return nil, fmt.Errorf("invalid sort direction: %s", sortDirection)
	}

	// Create the SQL query
	query := fmt.Sprintf("SELECT * FROM client ORDER BY %s %s LIMIT $1 OFFSET $2", sortField, sortDirection)
	fmt.Println(query)
	// Execute the query
	rows, err := store.db.QueryContext(ctx, query, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan the results into a Client slice
	var clients []Client
	for rows.Next() {
		var client Client
		if err := rows.Scan(&client.ID, &client.FullName, &client.PhoneWhatsapp, &client.PhoneLine, &client.PetName, &client.PetBreed, &client.AddressStreet, &client.AddressCity, &client.AddressNumber, &client.AddressNeighborhood, &client.AddressReference, &client.CreatedAt, &client.ChangedAt); err != nil {
			return nil, err
		}
		clients = append(clients, client)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return clients, nil
}

func (store *SortableSQLStore) SearchClients(ctx context.Context, search string, pageId int, pageSize int, sortField string, sortDirection string) ([]Client, error) {
	offset := (pageId - 1) * pageSize

	query := `SELECT * FROM client WHERE 
        LOWER(full_name) LIKE LOWER($1) OR 
        LOWER(phone_whatsapp) LIKE LOWER($1) OR 
        LOWER(phone_line) LIKE LOWER($1) OR 
        LOWER(pet_name) LIKE LOWER($1) OR 
        LOWER(pet_breed) LIKE LOWER($1) OR 
        LOWER(address_street) LIKE LOWER($1) OR 
		LOWER(address_city) LIKE LOWER($1) OR
        LOWER(address_number) LIKE LOWER($1) OR 
        LOWER(address_neighborhood) LIKE LOWER($1) OR 
        LOWER(address_reference) LIKE LOWER($1) OR
		CAST(id AS TEXT) LIKE LOWER($1)`

	if sortField != "" && sortDirection != "" {
		query += fmt.Sprintf(" ORDER BY %s %s", sortField, sortDirection)
	}

	query += " LIMIT $2 OFFSET $3"

	rows, err := store.db.QueryContext(ctx, query, "%"+search+"%", pageSize, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clients []Client
	for rows.Next() {
		var c Client
		if err = rows.Scan(&c.ID, &c.FullName, &c.PhoneWhatsapp, &c.PhoneLine, &c.PetName, &c.PetBreed, &c.AddressStreet, &c.AddressCity, &c.AddressNumber, &c.AddressNeighborhood, &c.AddressReference, &c.CreatedAt, &c.ChangedAt); err != nil {
			return nil, err
		}
		clients = append(clients, c)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return clients, nil
}

func (store *SortableSQLStore) ListSalesSorted(ctx context.Context, arg ListSalesParams, sortField string, sortDirection string) ([]Sale, error) {
	// Define a map of valid sort fields and directions
	validSortFields := map[string]bool{"product": true, "price": true, "created_at": true, "client_name": true}
	validSortDirections := map[string]bool{"asc": true, "desc": true}

	// If sortField is provided, validate it
	if sortField != "" {
		if !validSortFields[sortField] {
			return nil, fmt.Errorf("invalid sort field: %s", sortField)
		}
	} else {
		// If sortField is not provided, use a default value
		sortField = "product"
	}

	// If sortDirection is provided, validate it
	if sortDirection != "" {
		if !validSortDirections[sortDirection] {
			return nil, fmt.Errorf("invalid sort direction: %s", sortDirection)
		}
	} else {
		// If sortDirection is not provided, use a default value
		sortDirection = "asc"
	}

	// Create the SQL query
	query := fmt.Sprintf("SELECT * FROM sale ORDER BY %s %s LIMIT $1 OFFSET $2", sortField, sortDirection)

	// Execute the query
	rows, err := store.db.QueryContext(ctx, query, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan the results into a Sale slice
	var sales []Sale
	for rows.Next() {
		var sale Sale
		if err := rows.Scan(&sale.ID, &sale.ClientID, &sale.ClientName, &sale.Product, &sale.Price, &sale.Observation, &sale.CreatedAt, &sale.ChangedAt, &sale.PdfGeneratedAt); err != nil {
			return nil, err
		}
		sales = append(sales, sale)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return sales, nil
}

func (store *SortableSQLStore) SearchSales(ctx context.Context, search string, pageId int, pageSize int, sortField string, sortDirection string) ([]Sale, error) {
	offset := (pageId - 1) * pageSize

	query := `SELECT * FROM sale WHERE 
        LOWER(product) LIKE LOWER($1) OR 
		LOWER(client_name) LIKE LOWER($1) OR
        LOWER(observation) LIKE LOWER($1) OR
        CAST(price AS TEXT) LIKE LOWER($1) OR
		CAST(id AS TEXT) LIKE LOWER ($1)`

	if sortField != "" && sortDirection != "" {
		query += fmt.Sprintf(" ORDER BY %s %s", sortField, sortDirection)
	}

	query += " LIMIT $2 OFFSET $3"

	rows, err := store.db.QueryContext(ctx, query, "%"+search+"%", pageSize, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sales []Sale
	for rows.Next() {
		var s Sale
		if err = rows.Scan(&s.ID, &s.ClientID, &s.ClientName, &s.Product, &s.Price, &s.Observation, &s.CreatedAt, &s.ChangedAt, &s.PdfGeneratedAt); err != nil {
			return nil, err
		}
		sales = append(sales, s)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return sales, nil
}

func (store *SortableSQLStore) FilterProducts(ctx context.Context, categoryIds []int64, pageId int, pageSize int, sortField string, sortDirection string, search string) ([]Product, int64, error) {
	offset := (pageId - 1) * pageSize

	query := `
	SELECT id, name, description, user_id, username, price, old_price, sku, images, categories, url, created_at, changed_at 
	FROM products 
	WHERE ($1::bigint[] IS NOT NULL AND categories && $1) AND
	(LOWER(name) LIKE LOWER($2) OR
	LOWER(description) LIKE LOWER($2) OR
	CAST(price AS TEXT) LIKE LOWER($2) OR
	LOWER(username) LIKE LOWER($2) OR
	LOWER(sku) LIKE LOWER($2))
	`

	if sortField != "" && sortDirection != "" {
		query += fmt.Sprintf(" ORDER BY %s %s", sortField, sortDirection)
	}

	query += " LIMIT $3 OFFSET $4"

	rows, err := store.db.QueryContext(ctx, query, pq.Array(categoryIds), "%"+search+"%", pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		if err = rows.Scan(&p.ID, &p.Name, &p.Description, &p.UserID, &p.Username, &p.Price, &p.OldPrice, &p.Sku, pq.Array(&p.Images), pq.Array(&p.Categories), &p.Url, &p.CreatedAt, &p.ChangedAt); err != nil {
			return nil, 0, err
		}
		products = append(products, p)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	countQuery := `
    SELECT COUNT(*) 
    FROM products 
    WHERE ($1::bigint[] IS NOT NULL AND categories && $1) AND
    (LOWER(name) LIKE LOWER($2) OR
    LOWER(description) LIKE LOWER($2) OR
    CAST(price AS TEXT) LIKE LOWER($2) OR
    LOWER(username) LIKE LOWER($2) OR
    LOWER(sku) LIKE LOWER($2))
    `
	var totalCount int64
	if err := store.db.QueryRowContext(ctx, countQuery, pq.Array(categoryIds), "%"+search+"%").Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	return products, totalCount, nil
}

func (store *SortableSQLStore) ListProductsSorted(ctx context.Context, arg ListProductsParams, sortField string, sortDirection string) ([]Product, int64, error) {
	// Define a map of valid sort fields and directions
	validSortFields := map[string]bool{"name": true, "description": true, "price": true, "username": true, "sku": true, "created_at": true}
	validSortDirections := map[string]bool{"asc": true, "desc": true}

	// Validate the sort field and direction
	if !validSortFields[sortField] {
		return nil, 0, fmt.Errorf("invalid sort field: %s", sortField)
	}
	if !validSortDirections[sortDirection] {
		return nil, 0, fmt.Errorf("invalid sort direction: %s", sortDirection)
	}

	// Create the SQL query
	var query string
	if sortField == "price" {
		query = fmt.Sprintf("SELECT id, name, description, user_id, username, price, old_price, sku, images, categories, url, created_at, changed_at FROM products ORDER BY CAST(%s AS FLOAT) %s LIMIT $1 OFFSET $2", sortField, sortDirection)
	} else {
		query = fmt.Sprintf("SELECT id, name, description, user_id, username, price, old_price, sku, images, categories, url, created_at, changed_at FROM products ORDER BY %s %s LIMIT $1 OFFSET $2", sortField, sortDirection)
	}

	// Execute the query
	rows, err := store.db.QueryContext(ctx, query, arg.Limit, arg.Offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	// Scan the results into a Product slice
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Description, &product.UserID, &product.Username, &product.Price, &product.OldPrice, &product.Sku, pq.Array(&product.Images), pq.Array(&product.Categories), &product.Url, &product.CreatedAt, &product.ChangedAt); err != nil {
			return nil, 0, err
		}
		products = append(products, product)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	countQuery := "SELECT COUNT(*) FROM products"
	var totalCount int64
	if err := store.db.QueryRowContext(ctx, countQuery).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	return products, totalCount, nil
}

func (store *SortableSQLStore) SearchProducts(ctx context.Context, search string, pageId int, pageSize int, sortField string, sortDirection string) ([]Product, int64, error) {
	offset := (pageId - 1) * pageSize

	query := `SELECT id, name, description, user_id, username, price, old_price, sku, images, categories, url, created_at, changed_at FROM products WHERE
        LOWER(name) LIKE LOWER($1) OR
        LOWER(description) LIKE LOWER($1) OR
        CAST(price AS TEXT) LIKE LOWER($1) OR
        LOWER(username) LIKE LOWER($1) OR
        LOWER(sku) LIKE LOWER($1)`

	if sortField != "" && sortDirection != "" {
		query += fmt.Sprintf(" ORDER BY %s %s", sortField, sortDirection)
	}

	query += " LIMIT $2 OFFSET $3"

	rows, err := store.db.QueryContext(ctx, query, "%"+search+"%", pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		if err = rows.Scan(&p.ID, &p.Name, &p.Description, &p.UserID, &p.Username, &p.Price, &p.OldPrice, &p.Sku, pq.Array(&p.Images), pq.Array(&p.Categories), &p.Url, &p.CreatedAt, &p.ChangedAt); err != nil {
			return nil, 0, err
		}
		products = append(products, p)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, err
	}

	countQuery := `SELECT COUNT(*) FROM products WHERE
    LOWER(name) LIKE LOWER($1) OR
    LOWER(description) LIKE LOWER($1) OR
    CAST(price AS TEXT) LIKE LOWER($1) OR
    LOWER(username) LIKE LOWER($1) OR
    LOWER(sku) LIKE LOWER($1)`
	var totalCount int64
	if err := store.db.QueryRowContext(ctx, countQuery, "%"+search+"%").Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	return products, totalCount, nil
}

func (store *SortableSQLStore) ListImagesSorted(ctx context.Context, arg ListImagesParams, sortField string, sortDirection string) ([]Image, error) {
	// Define a map of valid sort fields and directions
	validSortFields := map[string]bool{"name": true, "description": true, "alt": true, "image_path": true}
	validSortDirections := map[string]bool{"asc": true, "desc": true}

	// Validate the sort field and direction
	if !validSortFields[sortField] {
		return nil, fmt.Errorf("invalid sort field: %s", sortField)
	}
	if !validSortDirections[sortDirection] {
		return nil, fmt.Errorf("invalid sort direction: %s", sortDirection)
	}

	// Create the SQL query
	query := fmt.Sprintf("SELECT * FROM images ORDER BY %s %s LIMIT $1 OFFSET $2", sortField, sortDirection)

	// Execute the query
	rows, err := store.db.QueryContext(ctx, query, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan the results into an Image slice
	var images []Image
	for rows.Next() {
		var image Image
		if err := rows.Scan(&image.ID, &image.Name, &image.Description, &image.Alt, &image.ImagePath, &image.CreatedAt, &image.ChangedAt); err != nil {
			return nil, err
		}
		images = append(images, image)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return images, nil
}

func (store *SortableSQLStore) SearchImages(ctx context.Context, search string, pageId int, pageSize int, sortField string, sortDirection string) ([]Image, error) {
	offset := (pageId - 1) * pageSize

	query := `SELECT * FROM images WHERE
        LOWER(name) LIKE LOWER($1) OR
        LOWER(description) LIKE LOWER($1) OR
        LOWER(alt) LIKE LOWER($1) OR
        LOWER(image_path) LIKE LOWER($1)`

	if sortField != "" && sortDirection != "" {
		query += fmt.Sprintf(" ORDER BY %s %s", sortField, sortDirection)
	}

	query += " LIMIT $2 OFFSET $3"

	rows, err := store.db.QueryContext(ctx, query, "%"+search+"%", pageSize, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []Image
	for rows.Next() {
		var i Image
		if err = rows.Scan(&i.ID, &i.Name, &i.Description, &i.Alt, &i.ImagePath, &i.CreatedAt, &i.ChangedAt); err != nil {
			return nil, err
		}
		images = append(images, i)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return images, nil
}
