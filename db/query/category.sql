-- name: CreateCategory :one
INSERT INTO categories (
    name,
    description
) VALUES (
    $1, $2
) RETURNING *;

-- name: GetCategory :one
SELECT * FROM categories 
WHERE id = $1 LIMIT 1;

-- name: CountCategory :one
SELECT COUNT(*) FROM categories;

-- name: ListCategories :many
SELECT * FROM categories 
ORDER BY id
LIMIT $1
OFFSET $2;

-- name: AssociateProductWithCategory :one
INSERT INTO product_categories (product_id, category_id)
VALUES ($1, $2)
RETURNING *;

-- name: DisassociateProductFromCategory :one
DELETE FROM product_categories
WHERE product_id = $1 AND category_id = $2
RETURNING *;

-- name: ListCategoriesByProduct :many
SELECT c.*
FROM categories c
JOIN product_categories pc ON c.id = pc.category_id
WHERE pc.product_id = $1
ORDER BY c.id;

-- name: ListProductsByCategory :many
SELECT p.*
FROM products p
JOIN product_categories pc ON p.id = pc.product_id
WHERE pc.category_id = $1
ORDER BY p.id;


-- name: UpdateCategory :one
UPDATE categories 
SET 
    name = COALESCE($2, name),
    description = COALESCE($3, description)
WHERE id = $1
RETURNING *;

-- name: DeleteCategory :exec
DELETE FROM categories 
WHERE id = $1;
