ALTER TABLE "product_images" DROP CONSTRAINT IF EXISTS "product_images_product_id_fkey";
ALTER TABLE "product_images" DROP CONSTRAINT IF EXISTS "product_images_image_id_fkey";
DROP TABLE IF EXISTS "product_images";

ALTER TABLE "images" DROP CONSTRAINT IF EXISTS "images_id_fkey";
DROP TABLE IF EXISTS "images";

ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_username_fkey";
DROP TABLE IF EXISTS "sessions";

ALTER TABLE "sale" DROP CONSTRAINT IF EXISTS "sale_client_id_fkey";
DROP TABLE IF EXISTS "sale";

ALTER TABLE "client" DROP CONSTRAINT IF EXISTS "client_id_fkey";
DROP TABLE IF EXISTS "client";

ALTER TABLE "product_categories" DROP CONSTRAINT IF EXISTS "product_categories_product_id_fkey";
ALTER TABLE "product_categories" DROP CONSTRAINT IF EXISTS "product_categories_category_id_fkey";
DROP TABLE IF EXISTS "product_categories";

ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_id_fkey";
DROP TABLE IF EXISTS "categories";

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_user_id_fkey";
DROP TABLE IF EXISTS "products";

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_id_fkey";
DROP TABLE IF EXISTS "users";