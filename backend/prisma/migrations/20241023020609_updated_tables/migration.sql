/*
  Warnings:

  - You are about to drop the `ListApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Listing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ListApproval" DROP CONSTRAINT "ListApproval_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ListApproval" DROP CONSTRAINT "ListApproval_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_artworkId_fkey";

-- AlterTable
ALTER TABLE "Artwork" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMinted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSold" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ListApproval";

-- DropTable
DROP TABLE "Listing";

-- CreateTable
CREATE TABLE "Approval" (
    "id" SERIAL NOT NULL,
    "artworkId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marketplace" (
    "id" SERIAL NOT NULL,
    "artworkId" INTEGER NOT NULL,
    "tokenId" INTEGER NOT NULL,

    CONSTRAINT "Marketplace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Approval_artworkId_key" ON "Approval"("artworkId");

-- CreateIndex
CREATE UNIQUE INDEX "Marketplace_artworkId_key" ON "Marketplace"("artworkId");

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marketplace" ADD CONSTRAINT "Marketplace_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

