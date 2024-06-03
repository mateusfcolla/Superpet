-- name: CreateClient :one
INSERT INTO client (
    full_name,
    phone_whatsapp,
    phone_line,
    pet_name,
    pet_breed,
    address_street,
    address_city,
    address_number,
    address_neighborhood,
    address_reference
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: GetClient :one
SELECT * FROM client
WHERE id = $1 LIMIT 1;

-- name: GetSalesByClientID :many
SELECT * FROM sale
WHERE client_id = $1;

-- name: ListClients :many
SELECT * FROM client
ORDER BY id DESC
LIMIT $1
OFFSET $2;

-- name: CountClients :one
SELECT COUNT(*) FROM client;

-- name: UpdateClient :one
UPDATE client 
SET 
    full_name = COALESCE($2, full_name),
    phone_whatsapp = COALESCE($3, phone_whatsapp),
    phone_line = COALESCE($4, phone_line),
    pet_name = COALESCE($5, pet_name),
    pet_breed = COALESCE($6, pet_breed),
    address_street = COALESCE($7, address_street),
    address_city = COALESCE($8, address_city),
    address_number = COALESCE($9, address_number),
    address_neighborhood = COALESCE($10, address_neighborhood),
    address_reference = COALESCE($11, address_reference)
WHERE id = $1
RETURNING *;

-- name: DeleteClient :exec
DELETE FROM client
WHERE id = $1;
