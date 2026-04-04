-- Allow up to 6 weeks per month (some months span 6 calendar weeks)
ALTER TABLE public.training_weeks
  DROP CONSTRAINT IF EXISTS training_weeks_week_number_check;
ALTER TABLE public.training_weeks
  ADD CONSTRAINT training_weeks_week_number_check CHECK (week_number BETWEEN 1 AND 6);

-- Add start_date to training_weeks (nullable for backward compat)
ALTER TABLE public.training_weeks
  ADD COLUMN IF NOT EXISTS start_date DATE;

-- Add calendar_date to training_days (nullable for backward compat)
ALTER TABLE public.training_days
  ADD COLUMN IF NOT EXISTS calendar_date DATE;
