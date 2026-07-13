-- Migration: Trust, Quality Assurance, Safety Badges & Warranty System

-- Add warranty_period to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS warranty_period VARCHAR(50) DEFAULT 'No Warranty';

-- Create warranties table
CREATE TABLE IF NOT EXISTS warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    warranty_number VARCHAR(100) UNIQUE NOT NULL,
    duration VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    qr_code_data TEXT NOT NULL,
    certificate_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create warranty_claims table
CREATE TABLE IF NOT EXISTS warranty_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warranty_id UUID NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- PENDING, ACCEPTED, REJECTED, RESOLVED
    photos_urls TEXT[] DEFAULT '{}',
    admin_outcome VARCHAR(50), -- rework, reject, partial_compensation, full_refund
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trust_scores table
CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fundi_profile_id UUID UNIQUE NOT NULL REFERENCES fundi_profiles(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 100 NOT NULL,
    verified_identity BOOLEAN DEFAULT FALSE NOT NULL,
    verified_certificates BOOLEAN DEFAULT FALSE NOT NULL,
    jobs_completed INTEGER DEFAULT 0 NOT NULL,
    avg_rating DECIMAL(3, 2) DEFAULT 5.00 NOT NULL,
    claim_rate DECIMAL(5, 2) DEFAULT 0.00 NOT NULL,
    cancellation_rate DECIMAL(5, 2) DEFAULT 0.00 NOT NULL,
    response_time_mins INTEGER DEFAULT 30 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
);

-- Create fundi_badges table
CREATE TABLE IF NOT EXISTS fundi_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fundi_profile_id UUID NOT NULL REFERENCES fundi_profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fundi_profile_id, badge_id)
);

-- Create fundi_levels table
CREATE TABLE IF NOT EXISTS fundi_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fundi_profile_id UUID UNIQUE NOT NULL REFERENCES fundi_profiles(id) ON DELETE CASCADE,
    current_level VARCHAR(50) DEFAULT 'BRONZE' NOT NULL, -- BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, ELITE
    points INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quality_reports table
CREATE TABLE IF NOT EXISTS quality_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default safety badges if empty
INSERT INTO badges (name, icon, description)
VALUES 
  ('Identity Verified', 'ShieldCheck', 'Identity verified using NIDA governmental systems.'),
  ('Profession Verified', 'Briefcase', 'Vetted skills matching primary specialties.'),
  ('VETA Certified', 'Award', 'Holds certified qualifications from VETA vocational institutes.'),
  ('Premium Fundi', 'Sparkles', 'Highly recommended partner with corporate clearance.'),
  ('Top Rated', 'Star', 'Maintains regular client feedback rating above 4.8 stars.'),
  ('Fast Response', 'Clock', 'Averages response window under 15 minutes.'),
  ('Warranty Provider', 'Shield', 'Offers warranty protection for customer bookings.'),
  ('Emergency Available', 'Zap', 'Available for 24/7 emergency dispatch requests.'),
  ('Background Checked', 'Lock', 'Has passed police records verification checks.')
ON CONFLICT (name) DO NOTHING;
