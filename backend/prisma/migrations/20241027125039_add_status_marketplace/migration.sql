-- AlterTable
ALTER TABLE "Marketplace" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'LISTED';

-- CreateIndex
CREATE INDEX "Marketplace_status_idx" ON "Marketplace"("status");
