CREATE TYPE "anchor_status" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'SKIPPED');

CREATE TABLE "ethereum_anchors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_type" VARCHAR(40) NOT NULL,
    "entity_id" VARCHAR(120) NOT NULL,
    "payload_hash" VARCHAR(66) NOT NULL,
    "chain_id" INTEGER,
    "network" VARCHAR(40),
    "tx_hash" VARCHAR(80),
    "block_number" BIGINT,
    "contract_address" VARCHAR(80),
    "status" "anchor_status" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "created_by" UUID,
    "raw_response" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMPTZ(6),

    CONSTRAINT "ethereum_anchors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ethereum_anchors_tx_hash_key" ON "ethereum_anchors"("tx_hash");
CREATE INDEX "idx_eth_anchor_entity" ON "ethereum_anchors"("entity_type", "entity_id");
CREATE INDEX "idx_eth_anchor_status" ON "ethereum_anchors"("status");
CREATE INDEX "idx_eth_anchor_created_at" ON "ethereum_anchors"("created_at");
