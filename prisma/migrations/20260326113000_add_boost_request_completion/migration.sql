ALTER TABLE "boost_requests"
  ADD COLUMN IF NOT EXISTS "completed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "boost_requests_completed_idx" ON "boost_requests"("completed");
