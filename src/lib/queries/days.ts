import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/user";
import type { TrainingDay, DayExerciseWithSets } from "@/types/database";

export async function getDayWithExercises(dayId: string): Promise<
  (TrainingDay & { day_exercises: DayExerciseWithSets[] }) | null
> {
  const [supabase, user] = await Promise.all([createClient(), getUser()]);
  if (!user) return null;

  const { data, error } = await supabase
    .from("training_days")
    .select(`
      *,
      day_exercises (
        *,
        exercise:exercises(*),
        sets:exercise_sets(*)
      )
    `)
    .eq("id", dayId)
    .eq("user_id", user.id)
    .order("order_index", { referencedTable: "day_exercises", ascending: true })
    .single();

  if (error) return null;
  return data as TrainingDay & { day_exercises: DayExerciseWithSets[] };
}
