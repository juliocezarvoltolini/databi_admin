/*
  Warnings:

  - You are about to drop the column `companyId` on the `profiles` table. All the data in the column will be lost.
  - Made the column `profileId` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_profileId_fkey";

-- DropIndex
DROP INDEX "public"."profiles_name_companyId_key";

-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "profileId" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."profile_companies" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_companies_profileId_companyId_key" ON "public"."profile_companies"("profileId", "companyId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_companies" ADD CONSTRAINT "profile_companies_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_companies" ADD CONSTRAINT "profile_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
