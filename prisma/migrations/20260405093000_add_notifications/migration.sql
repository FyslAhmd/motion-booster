CREATE TYPE "NotificationType" AS ENUM (
  'GENERAL',
  'AUTH_REGISTER',
  'AUTH_LOGIN',
  'ASSIGNMENT',
  'ADS_ACTIVATION_REQUEST',
  'ADS_DEACTIVATION_REQUEST'
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
  "title" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "href" TEXT,
  "metadata" JSONB,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notifications_user_id_fkey'
  ) THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "notifications_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "notifications_user_id_created_at_idx"
  ON "notifications"("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "notifications_user_id_is_read_idx"
  ON "notifications"("user_id", "is_read");
