-- DropForeignKey
ALTER TABLE "public"."dashboards" DROP CONSTRAINT "dashboards_companyId_fkey";

-- AlterTable
ALTER TABLE "public"."dashboards" ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."dashboards" ADD CONSTRAINT "dashboards_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
