DO $$
BEGIN
  CREATE TYPE "AccountEntryType" AS ENUM ('OTHER', 'TOTAL_ADJUSTMENT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "user_account_entries" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" "AccountEntryType" NOT NULL DEFAULT 'OTHER',
  "title" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "created_by_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_account_entries_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_account_entries_user_id_fkey'
  ) THEN
    ALTER TABLE "user_account_entries"
      ADD CONSTRAINT "user_account_entries_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_account_entries_created_by_id_fkey'
  ) THEN
    ALTER TABLE "user_account_entries"
      ADD CONSTRAINT "user_account_entries_created_by_id_fkey"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "user_account_entries_user_id_idx"
  ON "user_account_entries"("user_id");

CREATE INDEX IF NOT EXISTS "user_account_entries_type_idx"
  ON "user_account_entries"("type");

CREATE INDEX IF NOT EXISTS "user_account_entries_created_by_id_idx"
  ON "user_account_entries"("created_by_id");

CREATE INDEX IF NOT EXISTS "user_account_entries_created_at_idx"
  ON "user_account_entries"("created_at");
