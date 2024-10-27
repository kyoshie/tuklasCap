/*
  Warnings:

  - You are about to alter the column `price` on the `Artwork` table. The data in that column could be lost. The data in that column will be cast from `Decimal(28,8)` to `Decimal(28,18)`.
  - Added the required column `price` to the `Marketplace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Approval" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "Artwork" ADD COLUMN     "listedAt" TIMESTAMP(3),
ADD COLUMN     "soldAt" TIMESTAMP(3),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(28,18),
ALTER COLUMN "pendingApproval" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Marketplace" ADD COLUMN     "listedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price" DECIMAL(28,18) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Approval_adminId_idx" ON "Approval"("adminId");

-- CreateIndex
CREATE INDEX "Artwork_ownerId_idx" ON "Artwork"("ownerId");

-- CreateIndex
CREATE INDEX "Artwork_pendingApproval_idx" ON "Artwork"("pendingApproval");

-- CreateIndex
CREATE INDEX "Artwork_isApproved_idx" ON "Artwork"("isApproved");

-- CreateIndex
CREATE INDEX "Marketplace_tokenId_idx" ON "Marketplace"("tokenId");
