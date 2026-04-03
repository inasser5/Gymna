"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMonthName } from "@/lib/utils";

export async function createMonth(year: number, month: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = `${getMonthName(month)} ${year}`;

  // Create month
  const { data: newMonth, error: monthError } = await supabase
    .from("training_months")
    .insert({ user_id: user.id, name, year, month })
    .select()
    .single();

  if (monthError) throw new Error(monthError.message);

  // Auto-create 4 weeks
  const weeks = [1, 2, 3, 4].map((n) => ({
    month_id: newMonth.id,
    user_id: user.id,
    week_number: n,
    name: `Week ${n}`,
  }));

  const { error: weeksError } = await supabase
    .from("training_weeks")
    .insert(weeks);

  if (weeksError) throw new Error(weeksError.message);

  revalidatePath("/");
  return newMonth;
}

export async function deleteMonth(monthId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("training_months")
    .delete()
    .eq("id", monthId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
