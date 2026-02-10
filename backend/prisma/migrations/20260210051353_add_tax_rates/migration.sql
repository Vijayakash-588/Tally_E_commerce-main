-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "tax_amount" DECIMAL(12,2) DEFAULT 0,
ADD COLUMN     "tax_rate_id" UUID;

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(60) NOT NULL,
    "rate" DECIMAL(6,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_tax_rates_name" ON "tax_rates"("name");
