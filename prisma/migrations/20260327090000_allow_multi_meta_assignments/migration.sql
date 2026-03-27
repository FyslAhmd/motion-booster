-- Allow multiple users to be assigned to the same Meta object.
-- This migration removes the legacy unique index on meta_object_id and
-- enforces uniqueness only per (meta_object_id, meta_object_type, user_id).

DROP INDEX IF EXISTS "meta_ad_assignments_meta_object_id_key";

CREATE INDEX IF NOT EXISTS "meta_ad_assignments_meta_object_id_idx"
ON "meta_ad_assignments"("meta_object_id");

CREATE UNIQUE INDEX IF NOT EXISTS "meta_ad_assignments_meta_object_id_meta_object_type_user_id_key"
ON "meta_ad_assignments"("meta_object_id", "meta_object_type", "user_id");
