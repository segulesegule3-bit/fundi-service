-- Migration script for dynamic categories, multiple professions and NIDA verification

-- 1. Create fundi_professions join table
CREATE TABLE IF NOT EXISTS fundi_professions (
    "fundiProfileId" VARCHAR(255) NOT NULL,
    "professionId" VARCHAR(255) NOT NULL,
    PRIMARY KEY ("fundiProfileId", "professionId")
);

-- 2. Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
    "id" VARCHAR(255) PRIMARY KEY,
    "fundiProfileId" VARCHAR(255) NOT NULL,
    "licenseNumber" VARCHAR(255) NOT NULL,
    "issuingBody" VARCHAR(255) NOT NULL,
    "credentialUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create nida_verification_logs table
CREATE TABLE IF NOT EXISTS nida_verification_logs (
    "id" VARCHAR(255) PRIMARY KEY,
    "fundiProfileId" VARCHAR(255) NOT NULL,
    "nidaNumber" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) DEFAULT 'PENDING_VERIFICATION',
    "verifiedAt" TIMESTAMP WITH TIME ZONE,
    "responsePayload" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add dynamic registry columns to fundi_profiles
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS "nationalIdNumber" VARCHAR(255);
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS "education" VARCHAR(255);
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS "languagesSpoken" VARCHAR(255);
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS "workingRadius" DOUBLE PRECISION DEFAULT 15.0;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS "emergencyService" BOOLEAN DEFAULT FALSE;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS "regionId" INT;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS "districtId" INT;
ALTER TABLE fundi_profiles ADD COLUMN IF NOT EXISTS "wardId" INT;

-- 5. Data Migration: Copy existing single professions to many-to-many join table
-- First, make sure the columns exist in postgres
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='fundi_profiles' AND column_name='profession_id'
    ) THEN
        INSERT INTO fundi_professions ("fundiProfileId", "professionId")
        SELECT id, profession_id FROM fundi_profiles
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
