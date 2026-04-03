"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDayName(
  dayId: string,
  name: string,
  weekId: string,
  monthId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("training_days")
    .update({ name })
    .eq("id", dayId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/month/${monthId}/week/${weekId}`);
}

export async function toggleRestDay(
  dayId: string,
  isRestDay: boolean,
  weekId: string,
  monthId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("training_days")
    .update({ is_rest_day: isRestDay })
    .eq("id", dayId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/month/${monthId}/week/${weekId}`);
}

export async function markDayComplete(
  dayId: string,
  completed: boolean,
  weekId: string,
  monthId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("training_days")
    .update({ is_completed: completed })
    .eq("id", dayId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/month/${monthId}/week/${weekId}`);
}
