-- Add bilingual BN columns for dynamic CMS content

ALTER TABLE "hero_slides"
  ADD COLUMN IF NOT EXISTS "title_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "description_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "badge_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "cta_text_bn" TEXT;

ALTER TABLE "service_categories"
  ADD COLUMN IF NOT EXISTS "title_bn" TEXT;

ALTER TABLE "popular_services"
  ADD COLUMN IF NOT EXISTS "title_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "description_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "category_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "services_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "stats"
  ADD COLUMN IF NOT EXISTS "title_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "description_bn" TEXT;

ALTER TABLE "portfolio_items"
  ADD COLUMN IF NOT EXISTS "title_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "category_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "description_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "client_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "result_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "tags_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "testimonials"
  ADD COLUMN IF NOT EXISTS "role_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "review_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "service_bn" TEXT;

ALTER TABLE "team_members"
  ADD COLUMN IF NOT EXISTS "role_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "experience_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "projects_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "department_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "work_experience_bn" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "specialized_area_bn" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "education_bn" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "work_places_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "faqs"
  ADD COLUMN IF NOT EXISTS "question_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "answer_bn" TEXT;

ALTER TABLE "blog_posts"
  ADD COLUMN IF NOT EXISTS "title_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "excerpt_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "content_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "category_bn" TEXT,
  ADD COLUMN IF NOT EXISTS "tags_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];
