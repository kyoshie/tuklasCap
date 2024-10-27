/*
  Warnings:

  - You are about to drop the column `transactionHash` on the `Approval` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "transactionHash";

-- AlterTable
ALTER TABLE "Artwork" ADD COLUMN     "transactionHash" TEXT;
