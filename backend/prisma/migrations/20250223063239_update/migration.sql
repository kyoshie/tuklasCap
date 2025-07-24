/*
  Warnings:

  - The `photo` column on the `Kyc` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `validIdPhoto` column on the `Kyc` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Kyc" DROP COLUMN "photo",
ADD COLUMN     "photo" BYTEA,
DROP COLUMN "validIdPhoto",
ADD COLUMN     "validIdPhoto" BYTEA;
