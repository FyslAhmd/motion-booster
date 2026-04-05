CREATE TYPE "MetaStatusRequestState" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

CREATE TABLE IF NOT EXISTS "meta_status_requests" (
  "id" TEXT NOT NULL,
  "requester_user_id" TEXT NOT NULL,
  "reviewed_by_admin_id" TEXT,
  "meta_object_id" TEXT NOT NULL,
  "meta_object_type" "MetaObjectType" NOT NULL,
  "meta_account_id" TEXT,
  "meta_object_name" TEXT NOT NULL,
  "current_status" TEXT,
  "requested_status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "state" "MetaStatusRequestState" NOT NULL DEFAULT 'PENDING',
  "reason" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "meta_status_requests_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meta_status_requests_requester_user_id_fkey'
  ) THEN
    ALTER TABLE "meta_status_requests"
      ADD CONSTRAINT "meta_status_requests_requester_user_id_fkey"
      FOREIGN KEY ("requester_user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meta_status_requests_reviewed_by_admin_id_fkey'
  ) THEN
    ALTER TABLE "meta_status_requests"
      ADD CONSTRAINT "meta_status_requests_reviewed_by_admin_id_fkey"
      FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "meta_status_requests_requester_user_id_state_idx"
  ON "meta_status_requests"("requester_user_id", "state");

CREATE INDEX IF NOT EXISTS "meta_status_requests_meta_object_id_state_idx"
  ON "meta_status_requests"("meta_object_id", "state");

CREATE INDEX IF NOT EXISTS "meta_status_requests_state_created_at_idx"
  ON "meta_status_requests"("state", "created_at");
