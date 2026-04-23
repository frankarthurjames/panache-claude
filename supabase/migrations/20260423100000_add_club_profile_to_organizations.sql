ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS sport_id uuid REFERENCES sports(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS founded_year integer,
  ADD COLUMN IF NOT EXISTS members_count integer,
  ADD COLUMN IF NOT EXISTS federation text,
  ADD COLUMN IF NOT EXISTS practice_type text,
  ADD COLUMN IF NOT EXISTS public_type text,
  ADD COLUMN IF NOT EXISTS bon_a_savoir text,
  ADD COLUMN IF NOT EXISTS venue_1 text,
  ADD COLUMN IF NOT EXISTS venue_2 text,
  ADD COLUMN IF NOT EXISTS venue_3 text,
  ADD COLUMN IF NOT EXISTS accessibility_pmr boolean NOT NULL DEFAULT false;
