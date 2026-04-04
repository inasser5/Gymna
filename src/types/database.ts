// ============================================================
// GYMNA — Database Types (mirrors Supabase schema)
// ============================================================

export type WeightUnit = "kg" | "lbs";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingMonth {
  id: string;
  user_id: string;
  name: string;
  year: number;
  month: number;
  is_active: boolean;
  created_at: string;
}

export interface TrainingWeek {
  id: string;
  month_id: string;
  user_id: string;
  week_number: number;
  name: string;
  is_completed: boolean;
  created_at: string;
  start_date: string | null;
}

export interface TrainingDay {
  id: string;
  week_id: string;
  user_id: string;
  day_number: number;
  name: string;
  is_rest_day: boolean;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
  calendar_date: string | null;
}

export interface Exercise {
  id: string;
  user_id: string | null; // null = system exercise
  name: string;
  muscle_group: string;
  equipment: string;
  created_at: string;
}

export interface DayExercise {
  id: string;
  day_id: string;
  user_id: string;
  exercise_id: string;
  display_name: string;
  occurrence_index: number;
  order_index: number;
  notes: string | null;
  created_at: string;
  // joined
  exercise?: Exercise;
}

export interface ExerciseSet {
  id: string;
  day_exercise_id: string;
  user_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  weight_unit: WeightUnit;
  is_completed: boolean;
  rpe: number | null;
  created_at: string;
}

// ─── Composite / View Types ───────────────────────────────────

export interface DayExerciseWithSets extends DayExercise {
  sets: ExerciseSet[];
}

export interface TrainingDayWithExercises extends TrainingDay {
  day_exercises: DayExerciseWithSets[];
  volume?: number;
}

export interface TrainingWeekWithDays extends TrainingWeek {
  training_days: TrainingDay[];
}

export interface TrainingMonthWithWeeks extends TrainingMonth {
  training_weeks: TrainingWeekWithDays[];
}

// ─── Analytics ───────────────────────────────────────────────

export interface MaxWeightDataPoint {
  day_id: string;
  day_name: string;
  max_weight: number;
  logged_at: string;
}

// ─── Form / UI Types ─────────────────────────────────────────

export interface SetDraft {
  reps: number | null;
  weight: number | null;
  weight_unit: WeightUnit;
  rpe: number | null;
}
