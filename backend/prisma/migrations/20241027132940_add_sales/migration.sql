-- CreateTable
CREATE TABLE "Sale" (
    "id" SERIAL NOT NULL,
    "artworkId" INTEGER NOT NULL,
    "buyerAddress" TEXT NOT NULL,
    "price" DECIMAL(28,18) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sale_artworkId_idx" ON "Sale"("artworkId");

-- CreateIndex
CREATE INDEX "Sale_buyerAddress_idx" ON "Sale"("buyerAddress");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("dbId") ON DELETE RESTRICT ON UPDATE CASCADE;
