-- Migration: Support quotation based workflow and remove hourly rate fields conceptually

-- Add price_confirmed status to booking_status enum if not exists
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'price_confirmed';

-- Add pricing and negotiation columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS starting_price DECIMAL(12, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS inspection_fee DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_budget DECIMAL(12, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ai_estimated_min DECIMAL(12, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ai_estimated_max DECIMAL(12, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fundi_quote_price DECIMAL(12, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fundi_quote_arrival VARCHAR(100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fundi_quote_completion VARCHAR(100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fundi_quote_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_agreed_price DECIMAL(12, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS negotiation_status VARCHAR(50) DEFAULT 'none';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_negotiated_by VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_negotiation_price DECIMAL(12, 2);

-- Add inspection_fee to fundi profiles and professions
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS inspection_fee DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS inspection_fee DECIMAL(12, 2) DEFAULT 0.00;
