/*
  Warnings:

  - Made the column `photo` on table `Kyc` required. This step will fail if there are existing NULL values in that column.
  - Made the column `validIdPhoto` on table `Kyc` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Kyc" ALTER COLUMN "photo" SET NOT NULL,
ALTER COLUMN "validIdPhoto" SET NOT NULL;
