/*
  Warnings:

  - The primary key for the `Artwork` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Artwork` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contractId]` on the table `Artwork` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contractId` to the `Artwork` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_artworkId_fkey";

-- DropForeignKey
ALTER TABLE "Marketplace" DROP CONSTRAINT "Marketplace_artworkId_fkey";

-- AlterTable
ALTER TABLE "Artwork" DROP CONSTRAINT "Artwork_pkey",
DROP COLUMN "id",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "contractId" INTEGER NOT NULL,
ADD COLUMN     "dbId" SERIAL NOT NULL,
ADD COLUMN     "mintedAt" TIMESTAMP(3),
ADD CONSTRAINT "Artwork_pkey" PRIMARY KEY ("dbId");

-- CreateIndex
CREATE INDEX "Approval_status_idx" ON "Approval"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Artwork_contractId_key" ON "Artwork"("contractId");

-- CreateIndex
CREATE INDEX "Artwork_contractId_idx" ON "Artwork"("contractId");

-- CreateIndex
CREATE INDEX "Marketplace_price_idx" ON "Marketplace"("price");

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("dbId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marketplace" ADD CONSTRAINT "Marketplace_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("dbId") ON DELETE RESTRICT ON UPDATE CASCADE;
