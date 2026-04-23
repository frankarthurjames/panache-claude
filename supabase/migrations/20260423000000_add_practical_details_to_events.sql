ALTER TABLE events
  ADD COLUMN IF NOT EXISTS public_type text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS venue_type text,
  ADD COLUMN IF NOT EXISTS transport_car boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS transport_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS transport_train boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accessibility_pmr boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_deadline date;
