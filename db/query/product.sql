-- name: CreateProduct :one
INSERT INTO products (
    name,
    description,
    user_id,
    username,
    price,
    old_price,
    sku,
    url,
    categories,
    images
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: GetProduct :one
SELECT * FROM products 
WHERE id = $1 LIMIT 1;

-- name: GetProductByURL :one
SELECT * FROM products 
WHERE url = $1 LIMIT 1;

-- name: ListProductsByUser :many
SELECT * FROM products
WHERE user_id = $1
ORDER BY id;

-- name: ListProducts :many
SELECT * FROM products 
ORDER BY id DESC
LIMIT $1
OFFSET $2;




-- name: CountProducts :one
SELECT COUNT(*) FROM products;

-- name: UpdateProduct :one
UPDATE  products 
SET 
    name = COALESCE($2, name),
    description = COALESCE($3, description),
    user_id = COALESCE($4, user_id),
    username = COALESCE($5, username),
    price = COALESCE($6, price),
    old_price = COALESCE($7, old_price),
    sku = COALESCE($8, sku),
    url = COALESCE($9, url),
    images = COALESCE($10, images),
    categories = COALESCE($11, categories)
WHERE id = $1
RETURNING *;

-- name: DeleteProduct :exec
DELETE FROM products 
WHERE id = $1;