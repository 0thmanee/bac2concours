/*
  Warnings:

  - The values [EXPENSE_SUBMITTED,EXPENSE_APPROVED,EXPENSE_REJECTED,PROGRESS_UPDATE_SUBMITTED,PROGRESS_UPDATE_REMINDER,BUDGET_THRESHOLD_WARNING,BUDGET_EXCEEDED,STARTUP_ASSIGNED,STARTUP_STATUS_CHANGED,INCUBATION_ENDING_SOON] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `autoApproveExpenses` on the `incubator_settings` table. All the data in the column will be lost.
  - You are about to drop the column `updateFrequency` on the `incubator_settings` table. All the data in the column will be lost.
  - You are about to drop the column `budgetAlerts` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `expenseUpdates` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `progressReminders` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `startupUpdates` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the `_StartupStudents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budget_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `progress_updates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `startups` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SchoolStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('UNIVERSITE', 'ECOLE_INGENIEUR', 'ECOLE_COMMERCE', 'INSTITUT', 'FACULTE');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('USER_ACTIVATED', 'USER_DEACTIVATED', 'NEW_USER_REGISTERED', 'SYSTEM_ANNOUNCEMENT');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_StartupStudents" DROP CONSTRAINT "_StartupStudents_A_fkey";

-- DropForeignKey
ALTER TABLE "_StartupStudents" DROP CONSTRAINT "_StartupStudents_B_fkey";

-- DropForeignKey
ALTER TABLE "budget_categories" DROP CONSTRAINT "budget_categories_startupId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_startupId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_submittedById_fkey";

-- DropForeignKey
ALTER TABLE "progress_updates" DROP CONSTRAINT "progress_updates_startupId_fkey";

-- DropForeignKey
ALTER TABLE "progress_updates" DROP CONSTRAINT "progress_updates_submittedById_fkey";

-- AlterTable
ALTER TABLE "incubator_settings" DROP COLUMN "autoApproveExpenses",
DROP COLUMN "updateFrequency";

-- AlterTable
ALTER TABLE "notification_preferences" DROP COLUMN "budgetAlerts",
DROP COLUMN "expenseUpdates",
DROP COLUMN "progressReminders",
DROP COLUMN "startupUpdates";

-- DropTable
DROP TABLE "_StartupStudents";

-- DropTable
DROP TABLE "budget_categories";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "expenses";

-- DropTable
DROP TABLE "progress_updates";

-- DropTable
DROP TABLE "startups";

-- DropEnum
DROP TYPE "ExpenseStatus";

-- DropEnum
DROP TYPE "StartupStatus";

-- DropEnum
DROP TYPE "UpdateFrequency";

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "type" "SchoolType" NOT NULL,
    "description" TEXT NOT NULL,
    "longDescription" TEXT,
    "imageFileId" TEXT,
    "logoFileId" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "region" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "seuilDeSelection" DOUBLE PRECISION,
    "documentsRequis" TEXT[],
    "datesConcours" TEXT,
    "fraisInscription" DOUBLE PRECISION,
    "bourses" BOOLEAN NOT NULL DEFAULT false,
    "nombreEtudiants" INTEGER,
    "tauxReussite" DOUBLE PRECISION,
    "classementNational" INTEGER,
    "programs" JSONB,
    "specializations" TEXT[],
    "avantages" TEXT[],
    "services" TEXT[],
    "infrastructures" TEXT[],
    "partenariats" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "establishedYear" INTEGER,
    "status" "SchoolStatus" NOT NULL DEFAULT 'DRAFT',
    "uploadedById" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schools_status_idx" ON "schools"("status");

-- CreateIndex
CREATE INDEX "schools_type_idx" ON "schools"("type");

-- CreateIndex
CREATE INDEX "schools_city_idx" ON "schools"("city");

-- CreateIndex
CREATE INDEX "schools_isPublic_idx" ON "schools"("isPublic");

-- CreateIndex
CREATE INDEX "schools_featured_idx" ON "schools"("featured");

-- CreateIndex
CREATE INDEX "schools_uploadedById_idx" ON "schools"("uploadedById");

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
