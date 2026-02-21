-- PostgreSQL Database Schema for MLM Website
-- Note: Your backend uses Sequelize, which automatically creates these tables when the server starts. 
-- You DO NOT need to run this file manually unless you specifically want to see or build the structure.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE "Users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "referral_code" VARCHAR(255) NOT NULL UNIQUE,
    "sponsor_id" UUID, -- Null for root admin
    "role" VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    "status" VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("sponsor_id") REFERENCES "Users"("id") ON DELETE SET NULL
);

-- Referral Closure Table (For the Network Tree)
CREATE TABLE "ReferralClosures" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ancestor_id" UUID NOT NULL,
    "descendant_id" UUID NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ancestor_id") REFERENCES "Users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("descendant_id") REFERENCES "Users"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_referral_ancestor" ON "ReferralClosures" ("ancestor_id");
CREATE INDEX "idx_referral_descendant" ON "ReferralClosures" ("descendant_id");

-- Products Table
CREATE TABLE "Products" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "original_price" DECIMAL(10, 2),
    "tax" VARCHAR(50) DEFAULT 'included',
    "shipping_cost" DECIMAL(10, 2) DEFAULT 0.00,
    "image_url" VARCHAR(255),
    "category" VARCHAR(255),
    "status" VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    "referral_discount_percent" DECIMAL(5, 2) DEFAULT 0.00 NOT NULL,
    "member_commission_percent" DECIMAL(5, 2) DEFAULT 0.00 NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE "Orders" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "total_amount" DECIMAL(10, 2) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    "referral_code" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION
);

-- Order Items Table
CREATE TABLE "OrderItems" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE CASCADE,
    FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE NO ACTION
);

-- Commissions Table
CREATE TABLE "Commissions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL, 
    "source_user_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "level" INTEGER,
    "status" VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION,
    FOREIGN KEY ("source_user_id") REFERENCES "Users"("id") ON DELETE NO ACTION,
    FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE NO ACTION
);
