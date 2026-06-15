-- =============================================================
-- Miniput Database Schema
-- Generated from backend source analysis
-- PostgreSQL
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- TABLE: workspace
-- Must be created before users (FK dependency)
-- =============================================================
CREATE TABLE IF NOT EXISTS workspace (
    id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name          VARCHAR     NOT NULL,
    "createdAt"   TIMESTAMP   NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT workspace_name_unique UNIQUE (name)
);

-- =============================================================
-- TABLE: users
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
    id                    UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    username              VARCHAR     NOT NULL,
    email                 VARCHAR,
    phone                 VARCHAR,
    password_hash         VARCHAR,
    full_name             VARCHAR,
    role                  VARCHAR     NOT NULL DEFAULT 'admin',
    "activeWorkspaceId"   UUID,
    is_active             BOOLEAN     NOT NULL DEFAULT TRUE,
    last_login_at         TIMESTAMP,
    "isWhatsappReceiver"  BOOLEAN,
    profile_picture_url   VARCHAR,
    created_at            TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT users_username_unique UNIQUE (username),
    CONSTRAINT users_email_unique    UNIQUE (email),
    CONSTRAINT users_phone_unique    UNIQUE (phone),
    CONSTRAINT users_active_workspace_fk
        FOREIGN KEY ("activeWorkspaceId") REFERENCES workspace (id) ON DELETE SET NULL
);

-- =============================================================
-- TABLE: products
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
    id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "workspaceId"   UUID        NOT NULL,
    "articleId"     VARCHAR,
    name            VARCHAR     NOT NULL,
    category        VARCHAR     NOT NULL,
    price           NUMERIC     NOT NULL,
    "discountType"  VARCHAR     CHECK ("discountType" IN ('percent', 'fixed')),
    "discountValue" NUMERIC,
    stock           INTEGER     NOT NULL,
    "imageUrl"      TEXT[],
    description     TEXT,
    "isHidden"      BOOLEAN     NOT NULL DEFAULT FALSE,
    "sizeGroup"     VARCHAR,
    size            INTEGER[],
    "piecesPerPack" INTEGER     NOT NULL DEFAULT 1,
    "isTrending"    BOOLEAN     NOT NULL DEFAULT FALSE,
    "isBestseller"  BOOLEAN     NOT NULL DEFAULT FALSE,
    "isNewRelease"  BOOLEAN     NOT NULL DEFAULT FALSE,
    "createdAt"     TIMESTAMP   NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT products_workspace_fk
        FOREIGN KEY ("workspaceId") REFERENCES workspace (id) ON DELETE CASCADE
);

-- =============================================================
-- TABLE: cart_items
-- =============================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID        NOT NULL,
    product_id  UUID        NOT NULL,
    size        VARCHAR     NOT NULL,
    quantity    INTEGER     NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT cart_items_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT cart_items_product_fk
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- =============================================================
-- TABLE: favorites
-- =============================================================
CREATE TABLE IF NOT EXISTS favorites (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID        NOT NULL,
    product_id  UUID        NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT favorites_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT favorites_product_fk
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT favorites_user_product_unique UNIQUE (user_id, product_id)
);

-- =============================================================
-- TABLE: businesses
-- =============================================================
CREATE TABLE IF NOT EXISTS businesses (
    id                    UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id               UUID        NOT NULL,
    business_name         VARCHAR,
    business_phone        VARCHAR,
    delivery_address      TEXT,
    transport_courier     VARCHAR,
    gst_number            VARCHAR,
    agent_name            VARCHAR,
    filled_by             VARCHAR,
    special_instructions  TEXT,
    is_default            BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT businesses_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- =============================================================
-- TABLE: billing_profiles
-- =============================================================
CREATE TABLE IF NOT EXISTS billing_profiles (
    id                    UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id               UUID        NOT NULL,
    company_name          VARCHAR,
    billing_name          VARCHAR     NOT NULL,
    billing_phone         VARCHAR     NOT NULL,
    billing_email         VARCHAR,
    gst_number            VARCHAR,
    pan_number            VARCHAR,
    address_line_1        VARCHAR     NOT NULL,
    address_line_2        VARCHAR,
    city                  VARCHAR     NOT NULL,
    taluka                VARCHAR,
    state                 VARCHAR     NOT NULL,
    country               VARCHAR     NOT NULL DEFAULT 'India',
    pincode               VARCHAR     NOT NULL,
    special_instructions  TEXT,
    is_default            BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at            TIMESTAMP,
    created_at            TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT billing_profiles_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- =============================================================
-- TABLE: whatsapp_orders
-- =============================================================
CREATE TABLE IF NOT EXISTS whatsapp_orders (
    id                      UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "customerPhone"         VARCHAR     NOT NULL,
    "customerName"          VARCHAR,
    "orderMessage"          TEXT        NOT NULL,
    "parsedOrder"           JSONB,
    "messageId"             VARCHAR     NOT NULL,
    "userId"                UUID,
    status                  VARCHAR     NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'accepted', 'payment_pending', 'payment_received', 'shipped', 'cancelled')),
    "qrSent"                BOOLEAN     NOT NULL DEFAULT FALSE,
    "paymentScreenshotUrl"  VARCHAR,
    "paymentConfirmed"      BOOLEAN     NOT NULL DEFAULT FALSE,
    "lastCustomerMessageAt" TIMESTAMP,
    "createdAt"             TIMESTAMP   NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT whatsapp_orders_message_id_unique UNIQUE ("messageId"),
    CONSTRAINT whatsapp_orders_user_fk
        FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE SET NULL
);

-- =============================================================
-- TABLE: whatsapp_order_items
-- =============================================================
CREATE TABLE IF NOT EXISTS whatsapp_order_items (
    "whatsappOrderId"   UUID        NOT NULL,
    name                VARCHAR     NOT NULL,
    code                VARCHAR,
    qty                 INTEGER     NOT NULL,
    "workspaceId"       UUID,
    "createdAt"         TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT whatsapp_order_items_order_fk
        FOREIGN KEY ("whatsappOrderId") REFERENCES whatsapp_orders (id) ON DELETE CASCADE,
    CONSTRAINT whatsapp_order_items_workspace_fk
        FOREIGN KEY ("workspaceId") REFERENCES workspace (id) ON DELETE SET NULL
);

-- =============================================================
-- TABLE: brand_home_content
-- =============================================================
CREATE TABLE IF NOT EXISTS brand_home_content (
    "workspaceId"     UUID        NOT NULL PRIMARY KEY,
    hero_image_urls   TEXT[],
    promo_tags        TEXT[],
    "updatedAt"       TIMESTAMP,
    CONSTRAINT brand_home_content_workspace_fk
        FOREIGN KEY ("workspaceId") REFERENCES workspace (id) ON DELETE CASCADE
);

-- =============================================================
-- TABLE: about_content
-- Singleton table — only ever one row (id = 1)
-- =============================================================
CREATE TABLE IF NOT EXISTS about_content (
    id                  INTEGER     NOT NULL DEFAULT 1 PRIMARY KEY,
    miniput_details     TEXT[]      NOT NULL,
    kwink_details       TEXT[]      NOT NULL,
    address             VARCHAR     NOT NULL,
    whatsapp_number     VARCHAR     NOT NULL,
    phone_number        VARCHAR     NOT NULL,
    location_url        VARCHAR,
    qr_code_image_url   VARCHAR,
    "updatedAt"         TIMESTAMP   DEFAULT NOW(),
    CONSTRAINT about_content_singleton CHECK (id = 1)
);

-- =============================================================
-- INDEXES
-- =============================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_active_workspace    ON users ("activeWorkspaceId");
CREATE INDEX IF NOT EXISTS idx_users_role               ON users (role);

-- products
CREATE INDEX IF NOT EXISTS idx_products_workspace       ON products ("workspaceId");
CREATE INDEX IF NOT EXISTS idx_products_article_id      ON products ("articleId");
CREATE INDEX IF NOT EXISTS idx_products_category        ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_hidden       ON products ("isHidden");
CREATE INDEX IF NOT EXISTS idx_products_is_trending     ON products ("isTrending");
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller   ON products ("isBestseller");
CREATE INDEX IF NOT EXISTS idx_products_is_new_release  ON products ("isNewRelease");

-- cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_user          ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product       ON cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product  ON cart_items (user_id, product_id, size);

-- favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user           ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product        ON favorites (product_id);

-- businesses
CREATE INDEX IF NOT EXISTS idx_businesses_user          ON businesses (user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_default       ON businesses (user_id, is_default);

-- billing_profiles
CREATE INDEX IF NOT EXISTS idx_billing_profiles_user    ON billing_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_default ON billing_profiles (user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_deleted ON billing_profiles (deleted_at);

-- whatsapp_orders
CREATE INDEX IF NOT EXISTS idx_wa_orders_customer_phone ON whatsapp_orders ("customerPhone");
CREATE INDEX IF NOT EXISTS idx_wa_orders_user           ON whatsapp_orders ("userId");
CREATE INDEX IF NOT EXISTS idx_wa_orders_status         ON whatsapp_orders (status);
CREATE INDEX IF NOT EXISTS idx_wa_orders_created_at     ON whatsapp_orders ("createdAt" DESC);

-- whatsapp_order_items
CREATE INDEX IF NOT EXISTS idx_wa_order_items_order     ON whatsapp_order_items ("whatsappOrderId");
CREATE INDEX IF NOT EXISTS idx_wa_order_items_workspace ON whatsapp_order_items ("workspaceId");
