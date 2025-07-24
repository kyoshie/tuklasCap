/*
  Warnings:

  - You are about to drop the column `fullName` on the `Kyc` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Kyc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Kyc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middleName` to the `Kyc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kyc" DROP COLUMN "fullName",
ADD COLUMN     "firstName" VARCHAR(30) NOT NULL,
ADD COLUMN     "lastName" VARCHAR(3) NOT NULL,
ADD COLUMN     "middleName" VARCHAR(30) NOT NULL;
