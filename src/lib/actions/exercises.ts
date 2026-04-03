"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DayExercise } from "@/types/database";

export async function addExerciseToDay(
  dayId: string,
  exerciseId: string,
  weekId: string,
  monthId: string
): Promise<DayExercise> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: occurrenceIndex } = await supabase.rpc("get_next_occurrence_index", {
    p_day_id: dayId,
    p_exercise_id: exerciseId,
  });

  const { data: exercise } = await supabase
    .from("exercises")
    .select("name")
    .eq("id", exerciseId)
    .single();

  if (!exercise) throw new Error("Exercise not found");

  const { data: existing } = await supabase
    .from("day_exercises")
    .select("order_index")
    .eq("day_id", dayId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrderIndex =
    existing && existing.length > 0 ? existing[0].order_index + 1 : 0;
  const idx = occurrenceIndex ?? 0;
  const displayName = idx > 0 ? `${exercise.name} ${idx + 1}` : exercise.name;

  const { data: newExercise, error } = await supabase
    .from("day_exercises")
    .insert({
      day_id: dayId,
      exercise_id: exerciseId,
      display_name: displayName,
      occurrence_index: idx,
      order_index: nextOrderIndex,
      user_id: user.id,
    })
    .select("*, exercise:exercises(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/month/${monthId}/week/${weekId}/day/${dayId}`);
  return newExercise as DayExercise;
}

export async function removeExerciseFromDay(
  dayExerciseId: string,
  dayId: string,
  weekId: string,
  monthId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("day_exercises")
    .delete()
    .eq("id", dayExerciseId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/month/${monthId}/week/${weekId}/day/${dayId}`);
}

export async function updateDisplayName(
  dayExerciseId: string,
  displayName: string,
  dayId: string,
  weekId: string,
  monthId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("day_exercises")
    .update({ display_name: displayName })
    .eq("id", dayExerciseId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/month/${monthId}/week/${weekId}/day/${dayId}`);
}
