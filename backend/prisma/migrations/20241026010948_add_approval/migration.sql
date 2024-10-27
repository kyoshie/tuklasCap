-- AlterTable
ALTER TABLE "Approval" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "approvedAt" DROP NOT NULL,
ALTER COLUMN "approvedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Artwork" ADD COLUMN     "pendingApproval" BOOLEAN NOT NULL DEFAULT true;
