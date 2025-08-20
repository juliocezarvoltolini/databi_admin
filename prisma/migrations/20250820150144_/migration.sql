-- CreateTable
CREATE TABLE "public"."profile_dashboards" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,

    CONSTRAINT "profile_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_dashboards_profileId_dashboardId_key" ON "public"."profile_dashboards"("profileId", "dashboardId");

-- AddForeignKey
ALTER TABLE "public"."profile_dashboards" ADD CONSTRAINT "profile_dashboards_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_dashboards" ADD CONSTRAINT "profile_dashboards_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "public"."dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
