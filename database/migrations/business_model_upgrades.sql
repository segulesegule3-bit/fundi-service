-- Migration: Upgraded Business Model & Corporate Accounts

-- Add 'corporate' role to user_role enum if not exists
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'corporate';

-- Create corporate_accounts table
CREATE TABLE IF NOT EXISTS corporate_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    tin_number VARCHAR(100),
    billing_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create corporate_employees table
CREATE TABLE IF NOT EXISTS corporate_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corporate_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'employee' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create system_configs table
CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commission_rate DECIMAL(5, 2) DEFAULT 0.10 NOT NULL,
    sub_basic DECIMAL(12, 2) DEFAULT 29000.00 NOT NULL,
    sub_pro DECIMAL(12, 2) DEFAULT 59000.00 NOT NULL,
    sub_premium DECIMAL(12, 2) DEFAULT 99000.00 NOT NULL,
    promotion_fee DECIMAL(12, 2) DEFAULT 15000.00 NOT NULL,
    inspection_fee_base DECIMAL(12, 2) DEFAULT 5000.00 NOT NULL,
    corporate_discount DECIMAL(5, 2) DEFAULT 0.15 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add payment_option and corporate_id to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_option VARCHAR(50) DEFAULT 'online' NOT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS corporate_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL;

-- Seed system configuration if empty
INSERT INTO system_configs (commission_rate, sub_basic, sub_pro, sub_premium, promotion_fee, inspection_fee_base, corporate_discount)
SELECT 0.10, 29000.00, 59000.00, 99000.00, 15000.00, 5000.00, 0.15
WHERE NOT EXISTS (SELECT 1 FROM system_configs);
