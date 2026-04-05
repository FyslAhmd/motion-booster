-- CreateTable
CREATE TABLE "invoice_counters" (
    "counter_key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_counters_pkey" PRIMARY KEY ("counter_key")
);

INSERT INTO "invoice_counters" ("counter_key", "value")
VALUES ('GLOBAL', 0)
ON CONFLICT ("counter_key") DO NOTHING;
