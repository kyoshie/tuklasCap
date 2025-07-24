/*
  Warnings:

  - You are about to drop the column `email` on the `Kyc` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `Kyc` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Kyc" DROP COLUMN "email",
DROP COLUMN "verificationCode";
