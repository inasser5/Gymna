"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createWeekDays(weekId: string, monthId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const days = DAY_NAMES.map((name, i) => ({
    week_id: weekId,
    user_id: user.id,
    day_number: i + 1,
    name,
  }));

  const { error } = await supabase
    .from("training_days")
    .insert(days);

  if (error) throw new Error(error.message);
  revalidatePath(`/month/${monthId}`);
}

export async function cloneWeek(
  sourceWeekId: string,
  targetWeekId: string,
  monthId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.rpc("clone_week_to_week", {
    p_source_week_id: sourceWeekId,
    p_target_week_id: targetWeekId,
    p_user_id: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/month/${monthId}`);
}

export async function markWeekComplete(weekId: string, monthId: string, completed: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("training_weeks")
    .update({ is_completed: completed })
    .eq("id", weekId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/month/${monthId}`);
}
