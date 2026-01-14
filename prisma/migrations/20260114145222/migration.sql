/*
  Warnings:

  - You are about to drop the column `subject` on the `books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "books" DROP COLUMN "subject",
ADD COLUMN     "subjects" TEXT[],
ALTER COLUMN "level" SET DEFAULT 'Terminale';
