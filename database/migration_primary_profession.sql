-- Upgrades Fundi Professions Table to handle primary and secondary professions

-- 1. Drop the old composite primary key constraint on (fundiProfileId, professionId)
ALTER TABLE fundi_professions DROP CONSTRAINT IF EXISTS fundi_professions_pkey;

-- 2. Add an explicit unique ID column as primary key
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- 3. Rename "fundiProfileId" to "fundiId"
ALTER TABLE fundi_professions RENAME COLUMN "fundiProfileId" TO "fundiId";

-- 4. Rename "professionId" to "professionId" if needed (it is already named "professionId")
-- No-op since professionId is camelCase.

-- 5. Add "isPrimary" field and default to false
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS "isPrimary" BOOLEAN DEFAULT false;

-- 6. Add "createdAt" timestamp
ALTER TABLE fundi_professions ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 7. Seed logic: For any existing fundis, ensure at least one profession is marked primary.
UPDATE fundi_professions fp
SET "isPrimary" = true
WHERE fp.id IN (
  SELECT DISTINCT ON ("fundiId") id
  FROM fundi_professions
  ORDER BY "fundiId", "createdAt" ASC
);
