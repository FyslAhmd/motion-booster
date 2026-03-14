-- CreateTable
CREATE TABLE "user_budget_deposits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "note" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_budget_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_budget_deposits_user_id_idx" ON "user_budget_deposits"("user_id");

-- CreateIndex
CREATE INDEX "user_budget_deposits_created_by_id_idx" ON "user_budget_deposits"("created_by_id");

-- CreateIndex
CREATE INDEX "user_budget_deposits_created_at_idx" ON "user_budget_deposits"("created_at");

-- AddForeignKey
ALTER TABLE "user_budget_deposits" ADD CONSTRAINT "user_budget_deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_budget_deposits" ADD CONSTRAINT "user_budget_deposits_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
