-- Upgraded Fundi Professional Profile Migration
-- Production ready migrations for PostgreSQL

-- Create verification status type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'pending_verification', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Alter fundi_professions table
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0;
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS skill_level VARCHAR(50) DEFAULT 'Beginner';
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS starting_price DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS minimum_price DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS maximum_price DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS emergency_price DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS weekend_price DECIMAL(12,2) DEFAULT 0.00;

-- 2. Alter fundi_profiles table to support advanced profile attributes
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS service_area_type VARCHAR(50) DEFAULT 'RADIUS';
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS service_area_radius FLOAT DEFAULT 15.0;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS languages_spoken VARCHAR(255)[] DEFAULT '{}';
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS emergency_service_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS vacation_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS vacation_start DATE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS vacation_end DATE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS lunch_break_start TIME DEFAULT '12:00:00';
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS lunch_break_end TIME DEFAULT '13:00:00';
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS profession_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS certificate_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS veta_certified BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS premium_fundi BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS top_rated BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS background_checked BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 3. Create Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundi_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    certificate_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    image_url TEXT,
    verification_status verification_status DEFAULT 'pending_verification',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Education Table
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundi_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    level VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create/Upgrade Licenses Table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundi_profile_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) NOT NULL,
    authority VARCHAR(255) NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Upgrade Portfolio Items Table
-- Note: Check if table portfolio_items exists. In schema.sql it is portfolio_items, in prisma it is PortfolioImage
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS before_image_url TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS after_image_url TEXT;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS completion_date DATE;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS client_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS service_category VARCHAR(100);
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS client_review_id UUID REFERENCES bookings(id) ON DELETE SET NULL;

-- 7. Add Database Indexes
CREATE INDEX IF NOT EXISTS idx_fundi_professions_exp_level ON fundi_professions (experience_years, skill_level);
CREATE INDEX IF NOT EXISTS idx_certificates_fundi ON certificates (fundi_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates (verification_status);
CREATE INDEX IF NOT EXISTS idx_education_fundi ON education (fundi_id);
CREATE INDEX IF NOT EXISTS idx_licenses_fundi ON licenses (fundi_profile_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses (status);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_review ON portfolio_items (client_review_id);
