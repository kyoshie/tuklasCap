-- CreateTable
CREATE TABLE "Kyc" (
    "id" SERIAL NOT NULL,
    "fullName" VARCHAR(128) NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" VARCHAR(128) NOT NULL,
    "address" VARCHAR(256) NOT NULL,
    "photo" BYTEA NOT NULL,
    "validIdPhoto" BYTEA NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Kyc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_userId_key" ON "Kyc"("userId");

-- CreateIndex
CREATE INDEX "Kyc_status_idx" ON "Kyc"("status");

-- AddForeignKey
ALTER TABLE "Kyc" ADD CONSTRAINT "Kyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
