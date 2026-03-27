-- Add per-work-place logos for team members
ALTER TABLE "team_members"
ADD COLUMN "work_place_logos" TEXT[] DEFAULT ARRAY[]::TEXT[];
