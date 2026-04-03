import { createClient } from "@/lib/supabase/server";
import type { TrainingMonth, TrainingWeek } from "@/types/database";

export async function getMonths(): Promise<TrainingMonth[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("training_months")
    .select("*")
    .eq("user_id", user.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMonthWithWeeks(monthId: string): Promise<
  (TrainingMonth & { training_weeks: TrainingWeek[] }) | null
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("training_months")
    .select("*, training_weeks(*)")
    .eq("id", monthId)
    .eq("user_id", user.id)
    .order("week_number", { referencedTable: "training_weeks", ascending: true })
    .single();

  if (error) return null;
  return data as TrainingMonth & { training_weeks: TrainingWeek[] };
}
