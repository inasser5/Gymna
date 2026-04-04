"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDayName, toDateStr } from "@/lib/utils";

export async function createWeekDays(weekId: string, monthId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get week's start_date
  const { data: weekRaw } = await supabase
    .from("training_weeks")
    .select("start_date")
    .eq("id", weekId)
    .single();

  const week = weekRaw as { start_date: string | null } | null;

  if (week?.start_date) {
    // Generate calendar-based days from start_date until Saturday (or max 7 days)
    const [y, m, d] = week.start_date.split('-').map(Number);
    const days = [];
    const currentDate = new Date(y, m - 1, d);
    for (let i = 0; i < 7; i++) {
      const jsDay = currentDate.getDay();
      days.push({
        week_id: weekId,
        user_id: user.id,
        day_number: jsDay + 1,
        name: getDayName(jsDay + 1),
        calendar_date: toDateStr(currentDate),
      });
      if (jsDay === 6) break; // stop at Saturday
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const { error } = await supabase.from("training_days").insert(days);
    if (error) throw new Error(error.message);
  } else {
    // Legacy fallback for weeks without start_date
    const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const days = DAY_NAMES.map((name, i) => ({
      week_id: weekId,
      user_id: user.id,
      day_number: i + 1,
      name,
    }));
    const { error } = await supabase.from("training_days").insert(days);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/month/${monthId}`);
  revalidatePath(`/month/${monthId}/week/${weekId}`);
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
