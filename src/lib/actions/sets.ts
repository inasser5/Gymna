"use server";

import { createClient } from "@/lib/supabase/server";
import type { ExerciseSet } from "@/types/database";

export async function addSet(
  dayExerciseId: string,
  setNumber: number
): Promise<ExerciseSet> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("exercise_sets")
    .insert({
      day_exercise_id: dayExerciseId,
      set_number: setNumber,
      user_id: user.id,
      is_completed: false,
      weight_unit: "kg",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ExerciseSet;
}

export async function updateSet(
  setId: string,
  updates: {
    reps?: number | null;
    weight?: number | null;
    is_completed?: boolean;
    rpe?: number | null;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("exercise_sets")
    .update(updates)
    .eq("id", setId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

export async function deleteSet(setId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("exercise_sets")
    .delete()
    .eq("id", setId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
