-- name: CreateSliderImage :one
INSERT INTO slider_image_widget (
    image_id,
    "order"
) VALUES (
    $1, $2
) RETURNING *;

-- name: ListSliderImages :many
SELECT * FROM slider_image_widget
ORDER BY id DESC
LIMIT $1
OFFSET $2;

-- name: UpdateSliderImage :one
UPDATE slider_image_widget
SET "order" = COALESCE($2, "order")
WHERE id = $1
RETURNING *;

-- name: UpdateSliderImageByImageId :one
UPDATE slider_image_widget
SET "order" = COALESCE($2, "order")
WHERE image_id = $1
RETURNING *;

-- name: DeleteSliderImage :exec
DELETE FROM slider_image_widget
WHERE id = $1;

-- name: DeleteByImageId :exec
DELETE FROM slider_image_widget
WHERE image_id = $1;