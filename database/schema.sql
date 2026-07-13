-- Fundi Service Tanzania Database Schema
-- Production Ready, Modular, Scalable & Secure (PostgreSQL)

-- Enable PostGIS extension for geo-spatial queries (if available)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums for Roles and Statuses
CREATE TYPE user_role AS ENUM ('customer', 'fundi', 'admin', 'super_admin', 'support_officer', 'verification_officer', 'finance_officer', 'moderator');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending_verification', 'verified', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'on_the_way', 'started', 'completed', 'cancelled');
CREATE TYPE payment_gateway AS ENUM ('azampay', 'mpesa', 'airtel', 'tigo', 'halopesa', 'selcom', 'pesapal', 'stripe', 'flutterwave', 'paypal', 'wallet');
CREATE TYPE payment_status AS ENUM ('pending', 'held_in_escrow', 'released_to_fundi', 'refunded', 'failed');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdraw', 'escrow_hold', 'escrow_release', 'escrow_refund', 'commission', 'subscription', 'referral_bonus', 'loyalty_cashback');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved_refunded', 'resolved_released', 'cancelled');
CREATE TYPE sub_plan_tier AS ENUM ('free', 'silver', 'gold', 'premium');
CREATE TYPE ad_type AS ENUM ('banner', 'popup', 'featured_fundi', 'sponsored_listing');
CREATE TYPE ad_status AS ENUM ('pending', 'active', 'paused', 'completed');

-- 1. Tenants / Companies Table (Multi-Tenant Support)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    logo_url TEXT,
    branding_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Core Auth & Account)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    status user_status DEFAULT 'active',
    profile_picture_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    referred_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    loyalty_points INTEGER DEFAULT 0,
    
    -- Security Lockout & Session Rotation
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    refresh_token VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Login History Table
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    device_name VARCHAR(100),
    browser_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Regions, Districts, Wards, Villages Tables
CREATE TABLE regions (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE districts (
    id INT PRIMARY KEY,
    region_id INT REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE wards (
    id INT PRIMARY KEY,
    district_id INT REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE villages (
    id INT PRIMARY KEY,
    ward_id INT REFERENCES wards(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

-- 5. Professions Table
CREATE TABLE professions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_sw VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    commission_percentage DECIMAL(5,2) DEFAULT 10.00, -- e.g. 10.00%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fundi Profiles Table
CREATE TABLE fundi_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    profession_id UUID REFERENCES professions(id) ON DELETE RESTRICT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    experience_years INT DEFAULT 0,
    starting_price DECIMAL(12,2) DEFAULT 0.00,
    
    -- Location Data
    region_id INT REFERENCES regions(id),
    district_id INT REFERENCES districts(id),
    ward_id INT REFERENCES wards(id),
    village_id INT REFERENCES villages(id),
    gps_location GEOMETRY(Point, 4326), -- PostGIS point for geographic coordinates
    
    -- Availability
    working_days INT[] DEFAULT '{1,2,3,4,5}', -- Monday=1, Friday=5
    working_hours_start TIME DEFAULT '08:00:00',
    working_hours_end TIME DEFAULT '17:00:00',
    online_status BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE,
    
    -- Verification Documents
    verification_status verification_status DEFAULT 'unverified',
    verification_notes TEXT, -- Admin explanation of approval/rejections
    national_id_number VARCHAR(100),
    national_id_url TEXT,
    business_license_url TEXT,
    tin_number VARCHAR(100),
    tin_certificate_url TEXT,
    professional_certificate_url TEXT,
    face_verification_url TEXT,
    verified_badge BOOLEAN DEFAULT FALSE,
    
    -- Ratings & Stats
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    completed_jobs INT DEFAULT 0,
    average_response_time INT DEFAULT 0, -- in minutes
    
    -- Subscriptions
    subscription_plan sub_plan_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Wallets & Transactions (Digital Wallet & Escrow Ledger)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0.00),
    currency VARCHAR(10) DEFAULT 'TZS',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    type transaction_type NOT NULL,
    status VARCHAR(50) DEFAULT 'completed', -- pending, completed, failed, cancelled
    description TEXT,
    reference_id VARCHAR(100), -- external payment gateway ID or booking ID
    signature VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    fundi_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    profession_id UUID NOT NULL REFERENCES professions(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    photos_urls TEXT[] DEFAULT '{}',
    is_emergency BOOLEAN DEFAULT FALSE,
    status booking_status DEFAULT 'pending',
    service_price DECIMAL(12,2) NOT NULL,
    gps_latitude DECIMAL(9,6),
    gps_longitude DECIMAL(9,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Escrow Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    payer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount DECIMAL(15,2) NOT NULL,
    commission_amount DECIMAL(15,2) DEFAULT 0.00,
    gateway payment_gateway NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_reference VARCHAR(255) UNIQUE,
    escrow_release_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Disputes Table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    opened_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status dispute_status DEFAULT 'open',
    resolution_notes TEXT,
    resolved_by_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin ID
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Reviews & Ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    fundi_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    photos_urls TEXT[] DEFAULT '{}',
    video_url TEXT,
    is_fake BOOLEAN DEFAULT FALSE,
    fake_probability DECIMAL(5,2) DEFAULT 0.00, -- AI review scoring
    is_moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Chats & Messages
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_two_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_chat_participants UNIQUE(participant_one_id, participant_two_id)
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT,
    attachment_url TEXT,
    attachment_type VARCHAR(50), -- image, video, audio_note, location
    latitude DECIMAL(9,6), -- for location sharing
    longitude DECIMAL(9,6),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Job Marketplace Posts (Open Request Board)
CREATE TABLE job_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profession_id UUID NOT NULL REFERENCES professions(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    photos_urls TEXT[] DEFAULT '{}',
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    region_id INT REFERENCES regions(id),
    district_id INT REFERENCES districts(id),
    ward_id INT REFERENCES wards(id),
    village_id INT REFERENCES villages(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_post_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    fundi_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quotation_amount DECIMAL(12,2) NOT NULL,
    estimated_duration VARCHAR(100), -- e.g. "3 hours", "2 days"
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Subscriptions Plans Setup
CREATE TABLE subscription_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier sub_plan_tier UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    duration_days INT NOT NULL, -- e.g. 30 days
    features JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE fundi_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fundi_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES subscription_packages(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_reference VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Advertisements Table
CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    target_url TEXT,
    type ad_type NOT NULL,
    status ad_status DEFAULT 'pending',
    budget DECIMAL(12,2) DEFAULT 0.00,
    cost_per_click DECIMAL(10,2) DEFAULT 0.00,
    views_count INT DEFAULT 0,
    clicks_count INT DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- push, sms, email, whatsapp
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. System Settings
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Mobile App Releases Table
CREATE TABLE app_releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_code VARCHAR(50) NOT NULL,
    release_notes TEXT,
    type VARCHAR(20) NOT NULL, -- apk, aab, ios
    download_url TEXT NOT NULL,
    force_update BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Mobile App Download Analytics Table
CREATE TABLE app_download_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES app_releases(id) ON DELETE SET NULL,
    platform VARCHAR(20) NOT NULL, -- apk, play_store, app_store
    ip_address VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Tanzania',
    device_type VARCHAR(50),
    os_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Queries and Geospatial Searches
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_fundi_profiles_profession ON fundi_profiles(profession_id);
CREATE INDEX idx_fundi_profiles_verified ON fundi_profiles(verified_badge);
CREATE INDEX idx_fundi_profiles_online ON fundi_profiles(online_status);
CREATE INDEX idx_fundi_profiles_location ON fundi_profiles(region_id, district_id, ward_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_fundi ON bookings(fundi_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);

-- PostGIS Geospatial Index
CREATE INDEX idx_fundi_profiles_gps ON fundi_profiles USING GIST(gps_location);

-- 21. Corporate Business Accounts
CREATE TABLE corporate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Corporate account manager
    company_name VARCHAR(255) NOT NULL,
    tin_number VARCHAR(100) UNIQUE NOT NULL,
    business_license_url TEXT,
    industry_type VARCHAR(100) NOT NULL, -- school, hospital, hotel, company, government
    billing_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE corporate_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corporate_profile_id UUID NOT NULL REFERENCES corporate_profiles(id) ON DELETE CASCADE,
    employee_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User mapping
    spending_limit DECIMAL(12,2) DEFAULT 500000.00, -- Maximum budget limit per booking
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Loyalty System Engine
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percentage', -- percentage or flat
    value DECIMAL(10,2) NOT NULL, -- discount value
    min_booking_amount DECIMAL(12,2) DEFAULT 0.00,
    max_discount_amount DECIMAL(12,2),
    starts_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. Marketplace (Spare Parts, Electronics, Tools)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Fundi or Merchant
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    category VARCHAR(100) NOT NULL, -- spare_parts, electronics, tools, accessories
    image_urls TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_amount DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL, -- Platform commission percentage per sale
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
    shipping_address TEXT NOT NULL,
    payment_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL
);

-- 24. AI Logging & Prediction Models Analytics
CREATE TABLE ai_recommendations_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profession_id UUID REFERENCES professions(id) ON DELETE CASCADE,
    recommended_fundis UUID[] DEFAULT '{}', -- Array of fundi user IDs
    clicked_fundi_id UUID REFERENCES users(id) ON DELETE SET NULL,
    model_version VARCHAR(50) DEFAULT 'recommendation-v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_demand_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id INT REFERENCES regions(id),
    district_id INT REFERENCES districts(id),
    profession_id UUID REFERENCES professions(id),
    predicted_demand_score DECIMAL(5,2) NOT NULL, -- Predicted volume score (0 - 100)
    prediction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_prediction UNIQUE(region_id, district_id, profession_id, prediction_date)
);

-- Indexes for Marketplace and AI tables
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_product_orders_buyer ON product_orders(buyer_id);
CREATE INDEX idx_product_orders_status ON product_orders(status);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_ai_predictions ON ai_demand_predictions(prediction_date);
