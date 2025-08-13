-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_companyId_fkey";

-- AlterTable
ALTER TABLE "public"."profiles" ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
