CREATE TABLE "users" (
  "id" BIGSERIAL PRIMARY KEY,
  "username" varchar UNIQUE NOT NULL,
  "full_name" varchar NOT NULL,
  "email" varchar UNIQUE NOT NULL,
  "hashed_password" varchar NOT NULL,
  "password_changed_at" timestamptz NOT NULL DEFAULT '0001-01-01 00:00:00Z',
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "role" varchar NOT NULL DEFAULT 'User'
);

CREATE TABLE "products" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "description" varchar NOT NULL,
  "user_id" bigint NOT NULL,
  "username" varchar NOT NULL DEFAULT '',
  "price" float NOT NULL,
  "old_price" float NOT NULL,
  "sku" varchar NOT NULL DEFAULT '',
  "images" varchar[] NOT NULL DEFAULT '{}',
  "categories" bigint[] NOT NULL DEFAULT '{}',
  "url" varchar NOT NULL DEFAULT '' UNIQUE,
  "created_at" timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  "changed_at" timestamptz NOT NULL DEFAULT '0001-01-01 00:00:00Z'
);

ALTER TABLE "products" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

CREATE TABLE "categories" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "description" varchar NOT NULL
);

CREATE TABLE "product_categories" (
  "product_id" bigint NOT NULL,
  "category_id" bigint NOT NULL,
  CONSTRAINT unique_product_category UNIQUE (product_id, category_id)
);

ALTER TABLE "product_categories" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

ALTER TABLE "product_categories" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

CREATE TABLE "client" (
  "id" BIGSERIAL PRIMARY KEY,
  "full_name" varchar NOT NULL,
  "phone_whatsapp" varchar NOT NULL,
  "phone_line" varchar NOT NULL,
  "pet_name" varchar NOT NULL,
  "pet_breed" varchar NOT NULL,
  "address_street" varchar NOT NULL,
  "address_city" varchar NOT NULL,
  "address_number" varchar NOT NULL,
  "address_neighborhood" varchar NOT NULL,
  "address_reference" varchar NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  "changed_at" timestamptz NOT NULL DEFAULT '0001-01-01 00:00:00Z'
);

CREATE TABLE "sale" (
  "id" BIGSERIAL PRIMARY KEY,
  "client_id" BIGSERIAL NOT NULL,
  "client_name" varchar NOT NULL,
  "product" varchar NOT NULL,
  "price" float NOT NULL,
  "observation" varchar NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  "changed_at" timestamptz NOT NULL DEFAULT '0001-01-01 00:00:00Z',
  "pdf_generated_at" timestamptz NOT NULL DEFAULT '0001-01-01 00:00:00Z'
);

ALTER TABLE "sale" ADD FOREIGN KEY ("client_id") REFERENCES "client" ("id");

CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY,
  "username" varchar NOT NULL,
  "refresh_token" varchar NOT NULL,
  "user_agent" varchar NOT NULL,
  "client_ip" varchar NOT NULL,
  "is_blocked" boolean NOT NULL DEFAULT false,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

ALTER TABLE "sessions" ADD FOREIGN KEY ("username") REFERENCES "users" ("username");

CREATE TABLE "images" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "description" varchar NOT NULL,
  "alt" varchar NOT NULL,
  "image_path" varchar NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  "changed_at" timestamptz NOT NULL DEFAULT '0001-01-01 00:00:00Z'
);

CREATE TABLE "product_images" (
  "product_id" bigint NOT NULL,
  "image_id" bigint NOT NULL,
  "order" int NOT NULL DEFAULT 0,
  CONSTRAINT unique_product_image UNIQUE (product_id, image_id)
);

ALTER TABLE "product_images" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

ALTER TABLE "product_images" ADD FOREIGN KEY ("image_id") REFERENCES "images" ("id");

CREATE TABLE "slider_image_widget" (
  "id" BIGSERIAL PRIMARY KEY,
  "image_id" bigint NOT NULL,
  "order" int NOT NULL DEFAULT 0,
  CONSTRAINT unique_slider_image UNIQUE (id, image_id)
);

ALTER TABLE "slider_image_widget" ADD FOREIGN KEY ("image_id") REFERENCES "images" ("id");
