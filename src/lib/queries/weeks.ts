import { createClient } from "@/lib/supabase/server";
import type { TrainingWeek, TrainingDay } from "@/types/database";

export async function getWeekWithDays(weekId: string): Promise<
  (TrainingWeek & { training_days: TrainingDay[] }) | null
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("training_weeks")
    .select("*, training_days(*)")
    .eq("id", weekId)
    .eq("user_id", user.id)
    .order("day_number", { referencedTable: "training_days", ascending: true })
    .single();

  if (error) return null;
  return data as TrainingWeek & { training_days: TrainingDay[] };
}
