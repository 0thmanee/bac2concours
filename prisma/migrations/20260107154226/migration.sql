/*
  Warnings:

  - You are about to drop the column `rating` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_RESOURCE';

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_bookId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_videoId_fkey";

-- AlterTable
ALTER TABLE "books" DROP COLUMN "rating";

-- AlterTable
ALTER TABLE "videos" DROP COLUMN "rating";

-- DropTable
DROP TABLE "reviews";

-- DropEnum
DROP TYPE "ReviewStatus";

-- DropEnum
DROP TYPE "ReviewableType";
