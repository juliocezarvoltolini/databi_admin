/*
  Warnings:

  - You are about to drop the `profile_companies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `companyId` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add the companyId column as nullable first
ALTER TABLE "public"."profiles" ADD COLUMN "companyId" TEXT;

-- Step 2: Migrate data from profile_companies to profiles
-- For each profile, take the first company relationship (since we're changing to 1:1)
UPDATE "public"."profiles" 
SET "companyId" = (
  SELECT "companyId" 
  FROM "public"."profile_companies" 
  WHERE "profile_companies"."profileId" = "profiles"."id" 
  LIMIT 1
);

-- Step 3: For profiles without a company relationship, assign them to the first available company
UPDATE "public"."profiles" 
SET "companyId" = (
  SELECT "id" 
  FROM "public"."companies" 
  WHERE "isActive" = true 
  LIMIT 1
)
WHERE "companyId" IS NULL;

-- Step 4: Make the column required
ALTER TABLE "public"."profiles" ALTER COLUMN "companyId" SET NOT NULL;

-- Step 5: Drop foreign key constraints from profile_companies
ALTER TABLE "public"."profile_companies" DROP CONSTRAINT "profile_companies_companyId_fkey";
ALTER TABLE "public"."profile_companies" DROP CONSTRAINT "profile_companies_profileId_fkey";

-- Step 6: Drop the profile_companies table
DROP TABLE "public"."profile_companies";

-- Step 7: Add foreign key constraint to profiles
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
