/*
  Warnings:

  - You are about to alter the column `title` on the `Artwork` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `description` on the `Artwork` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `username` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `bio` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.

*/
-- AlterTable
ALTER TABLE "Artwork" ALTER COLUMN "title" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(128);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(128);
