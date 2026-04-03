-- ============================================================
-- GYMNA — Initial Schema
-- Auth: Supabase Google OAuth (auth.uid() based RLS)
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email      = excluded.email,
    full_name  = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── TRAINING MONTHS ─────────────────────────────────────────
create table public.training_months (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,                  -- e.g. "April 2025"
  year        int  not null,
  month       int  not null check (month between 1 and 12),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (user_id, year, month)
);

alter table public.training_months enable row level security;

create policy "Users can crud own months"
  on public.training_months for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── TRAINING WEEKS ──────────────────────────────────────────
create table public.training_weeks (
  id           uuid primary key default uuid_generate_v4(),
  month_id     uuid not null references public.training_months(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  week_number  int  not null check (week_number between 1 and 4),
  name         text not null default '',       -- e.g. "Week 1"
  is_completed boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (month_id, week_number)
);

alter table public.training_weeks enable row level security;

create policy "Users can crud own weeks"
  on public.training_weeks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── TRAINING DAYS ───────────────────────────────────────────
create table public.training_days (
  id           uuid primary key default uuid_generate_v4(),
  week_id      uuid not null references public.training_weeks(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  day_number   int  not null check (day_number between 1 and 7),
  name         text not null default '',       -- e.g. "Monday — Push"
  is_rest_day  boolean not null default false,
  is_completed boolean not null default false,
  notes        text,
  created_at   timestamptz not null default now(),
  unique (week_id, day_number)
);

alter table public.training_days enable row level security;

create policy "Users can crud own days"
  on public.training_days for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── EXERCISES (system + user) ───────────────────────────────
create table public.exercises (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.profiles(id) on delete cascade, -- NULL = system exercise
  name          text not null,
  muscle_group  text not null default 'Other',
  equipment     text not null default 'Barbell',
  created_at    timestamptz not null default now()
);

alter table public.exercises enable row level security;

create policy "Anyone can read system exercises"
  on public.exercises for select
  using (user_id is null or auth.uid() = user_id);

create policy "Users can create own exercises"
  on public.exercises for insert
  with check (auth.uid() = user_id);

create policy "Users can update own exercises"
  on public.exercises for update
  using (auth.uid() = user_id);

create policy "Users can delete own exercises"
  on public.exercises for delete
  using (auth.uid() = user_id);

-- ─── DAY EXERCISES ───────────────────────────────────────────
create table public.day_exercises (
  id               uuid primary key default uuid_generate_v4(),
  day_id           uuid not null references public.training_days(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  exercise_id      uuid not null references public.exercises(id) on delete restrict,
  display_name     text not null,             -- editable, e.g. "Bench Press x2"
  occurrence_index int  not null default 1,   -- auto-numbering: 1, 2, 3...
  order_index      int  not null default 0,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.day_exercises enable row level security;

create policy "Users can crud own day_exercises"
  on public.day_exercises for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── EXERCISE SETS ───────────────────────────────────────────
create table public.exercise_sets (
  id              uuid primary key default uuid_generate_v4(),
  day_exercise_id uuid not null references public.day_exercises(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  set_number      int  not null,
  reps            int,
  weight          numeric(6,2),
  weight_unit     text not null default 'kg' check (weight_unit in ('kg', 'lbs')),
  is_completed    boolean not null default false,
  rpe             numeric(3,1) check (rpe between 1 and 10),
  created_at      timestamptz not null default now()
);

alter table public.exercise_sets enable row level security;

create policy "Users can crud own sets"
  on public.exercise_sets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── HELPER: get_next_occurrence_index ───────────────────────
-- Returns the next occurrence index for an exercise in a given day
-- Used for auto-numbering: Bench Press x1, Bench Press x2
create or replace function public.get_next_occurrence_index(
  p_day_id     uuid,
  p_exercise_id uuid
)
returns int language plpgsql security definer as $$
declare
  v_max int;
begin
  select coalesce(max(occurrence_index), 0)
    into v_max
    from public.day_exercises
   where day_id = p_day_id
     and exercise_id = p_exercise_id;
  return v_max + 1;
end;
$$;

-- ─── HELPER: clone_week_to_week ──────────────────────────────
-- Copies all days → exercises → sets from source week into target week.
-- Clears is_completed on all cloned rows.
create or replace function public.clone_week_to_week(
  p_source_week_id uuid,
  p_target_week_id uuid,
  p_user_id        uuid
)
returns void language plpgsql security definer as $$
declare
  r_day       record;
  r_exercise  record;
  r_set       record;
  v_new_day_id      uuid;
  v_new_exercise_id uuid;
begin
  -- Verify ownership
  if not exists (
    select 1 from public.training_weeks
     where id = p_source_week_id and user_id = p_user_id
  ) then
    raise exception 'Unauthorized';
  end if;

  for r_day in
    select * from public.training_days
     where week_id = p_source_week_id
  loop
    -- Insert cloned day
    insert into public.training_days
      (week_id, user_id, day_number, name, is_rest_day, is_completed, notes)
    values
      (p_target_week_id, p_user_id, r_day.day_number, r_day.name,
       r_day.is_rest_day, false, r_day.notes)
    on conflict (week_id, day_number) do update set
      name        = excluded.name,
      is_rest_day = excluded.is_rest_day,
      notes       = excluded.notes,
      is_completed = false
    returning id into v_new_day_id;

    for r_exercise in
      select * from public.day_exercises
       where day_id = r_day.id
    loop
      -- Insert cloned day_exercise
      insert into public.day_exercises
        (day_id, user_id, exercise_id, display_name, occurrence_index, order_index, notes)
      values
        (v_new_day_id, p_user_id, r_exercise.exercise_id,
         r_exercise.display_name, r_exercise.occurrence_index,
         r_exercise.order_index, r_exercise.notes)
      returning id into v_new_exercise_id;

      for r_set in
        select * from public.exercise_sets
         where day_exercise_id = r_exercise.id
      loop
        -- Insert cloned set (not completed)
        insert into public.exercise_sets
          (day_exercise_id, user_id, set_number, reps, weight, weight_unit, is_completed, rpe)
        values
          (v_new_exercise_id, p_user_id, r_set.set_number,
           r_set.reps, r_set.weight, r_set.weight_unit, false, r_set.rpe);
      end loop;
    end loop;
  end loop;
end;
$$;

-- ─── HELPER: calculate_day_volume ────────────────────────────
-- Returns total volume (weight × reps) for a day
create or replace function public.calculate_day_volume(p_day_id uuid)
returns numeric language sql security definer as $$
  select coalesce(sum(s.weight * s.reps), 0)
    from public.exercise_sets s
    join public.day_exercises de on de.id = s.day_exercise_id
   where de.day_id = p_day_id
     and s.is_completed = true
     and s.weight is not null
     and s.reps is not null;
$$;

-- ─── HELPER: get_exercise_max_weight_history ─────────────────
-- Returns max weight per day for a given exercise (for analytics chart)
create or replace function public.get_exercise_max_weight_history(
  p_user_id    uuid,
  p_exercise_id uuid,
  p_limit      int default 20
)
returns table (
  day_id   uuid,
  day_name text,
  max_weight numeric,
  logged_at  timestamptz
) language sql security definer as $$
  select
    td.id,
    td.name,
    max(s.weight),
    max(s.created_at)
  from public.exercise_sets s
  join public.day_exercises de on de.id = s.day_exercise_id
  join public.training_days td on td.id = de.day_id
  where de.user_id = p_user_id
    and de.exercise_id = p_exercise_id
    and s.is_completed = true
    and s.weight is not null
  group by td.id, td.name
  order by max(s.created_at) desc
  limit p_limit;
$$;

-- ─── SEED: SYSTEM EXERCISES ──────────────────────────────────
insert into public.exercises (user_id, name, muscle_group, equipment) values
  -- Chest
  (null, 'Bench Press',            'Chest',     'Barbell'),
  (null, 'Incline Bench Press',    'Chest',     'Barbell'),
  (null, 'Decline Bench Press',    'Chest',     'Barbell'),
  (null, 'Dumbbell Fly',           'Chest',     'Dumbbell'),
  (null, 'Cable Fly',              'Chest',     'Cable'),
  (null, 'Dumbbell Press',         'Chest',     'Dumbbell'),
  (null, 'Push-up',                'Chest',     'Bodyweight'),
  -- Back
  (null, 'Deadlift',               'Back',      'Barbell'),
  (null, 'Pull-up',                'Back',      'Bodyweight'),
  (null, 'Barbell Row',            'Back',      'Barbell'),
  (null, 'Seated Cable Row',       'Back',      'Cable'),
  (null, 'Lat Pulldown',           'Back',      'Cable'),
  (null, 'T-Bar Row',              'Back',      'Machine'),
  (null, 'Single Arm Dumbbell Row','Back',      'Dumbbell'),
  -- Shoulders
  (null, 'Overhead Press',         'Shoulders', 'Barbell'),
  (null, 'Dumbbell Shoulder Press','Shoulders', 'Dumbbell'),
  (null, 'Lateral Raise',          'Shoulders', 'Dumbbell'),
  (null, 'Front Raise',            'Shoulders', 'Dumbbell'),
  (null, 'Face Pull',              'Shoulders', 'Cable'),
  (null, 'Arnold Press',           'Shoulders', 'Dumbbell'),
  -- Legs
  (null, 'Squat',                  'Legs',      'Barbell'),
  (null, 'Romanian Deadlift',      'Legs',      'Barbell'),
  (null, 'Leg Press',              'Legs',      'Machine'),
  (null, 'Hack Squat',             'Legs',      'Machine'),
  (null, 'Leg Extension',          'Legs',      'Machine'),
  (null, 'Leg Curl',               'Legs',      'Machine'),
  (null, 'Calf Raise',             'Legs',      'Machine'),
  (null, 'Bulgarian Split Squat',  'Legs',      'Dumbbell'),
  (null, 'Walking Lunges',         'Legs',      'Dumbbell'),
  -- Arms
  (null, 'Barbell Curl',           'Biceps',    'Barbell'),
  (null, 'Dumbbell Curl',          'Biceps',    'Dumbbell'),
  (null, 'Hammer Curl',            'Biceps',    'Dumbbell'),
  (null, 'Preacher Curl',          'Biceps',    'Barbell'),
  (null, 'Tricep Pushdown',        'Triceps',   'Cable'),
  (null, 'Skull Crusher',          'Triceps',   'Barbell'),
  (null, 'Overhead Tricep Extension','Triceps', 'Dumbbell'),
  (null, 'Close Grip Bench Press', 'Triceps',   'Barbell'),
  -- Core
  (null, 'Plank',                  'Core',      'Bodyweight'),
  (null, 'Ab Wheel Rollout',       'Core',      'Bodyweight'),
  (null, 'Cable Crunch',           'Core',      'Cable'),
  (null, 'Hanging Leg Raise',      'Core',      'Bodyweight')
on conflict do nothing;
