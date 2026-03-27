CREATE TABLE IF NOT EXISTS "activity_history" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "event_type" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "path" TEXT,
  "method" VARCHAR(10),
  "ip_address" TEXT,
  "user_agent" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_history_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activity_history_user_id_fkey'
  ) THEN
    ALTER TABLE "activity_history"
      ADD CONSTRAINT "activity_history_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "activity_history_user_id_idx" ON "activity_history"("user_id");
CREATE INDEX IF NOT EXISTS "activity_history_event_type_idx" ON "activity_history"("event_type");
CREATE INDEX IF NOT EXISTS "activity_history_created_at_idx" ON "activity_history"("created_at");
