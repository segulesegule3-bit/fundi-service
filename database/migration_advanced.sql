-- Migration script for Advanced Fundi Profile & Service Features

-- Create Portfolio Items Table
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fundi_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_urls TEXT[] DEFAULT '{}',
    video_url TEXT,
    before_image_url TEXT,
    after_image_url TEXT,
    completion_date DATE,
    client_approved BOOLEAN DEFAULT FALSE,
    service_category VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for portfolio search
CREATE INDEX IF NOT EXISTS idx_portfolio_items_fundi ON portfolio_items(fundi_id);

-- Alter Reviews table to include Before & After fields and Project details
ALTER TABLE reviews 
    ADD COLUMN IF NOT EXISTS before_photos_urls TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS after_photos_urls TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS project_cost DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS completion_date DATE;

-- Alter Fundi Profiles to add availability details and service warranties
ALTER TABLE fundi_profiles
    ADD COLUMN IF NOT EXISTS service_warranty VARCHAR(50) DEFAULT '30 Days',
    ADD COLUMN IF NOT EXISTS vacation_dates DATE[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS emergency_availability BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS on_site_service BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS remote_service BOOLEAN DEFAULT FALSE;

-- Quotes and Requests Board Tables (Bids is already created in schema.sql as job_bids)
-- Let's make sure job_posts / job_bids has columns we need.
-- If required, let's add quotation details to job_bids.
ALTER TABLE job_bids
    ADD COLUMN IF NOT EXISTS warranty_period VARCHAR(50) DEFAULT '30 Days',
    ADD COLUMN IF NOT EXISTS materials_included BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS completion_time VARCHAR(100),
    ADD COLUMN IF NOT EXISTS notes TEXT;
