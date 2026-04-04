"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMonthName, getCalendarWeeks, getDayName, toDateStr } from "@/lib/utils";

export async function createMonth(year: number, month: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = `${getMonthName(month)} ${year}`;
  const calendarWeeks = getCalendarWeeks(year, month);

  const { data: newMonth, error: monthError } = await supabase
    .from("training_months")
    .insert({ user_id: user.id, name, year, month })
    .select()
    .single();

  if (monthError) throw new Error(monthError.message);

  const weeksToInsert = calendarWeeks.map((w) => ({
    month_id: newMonth.id,
    user_id: user.id,
    week_number: w.weekNumber,
    name: `Week ${w.weekNumber}`,
    start_date: toDateStr(w.startDate),
  }));

  const { data: insertedWeeks, error: weeksError } = await supabase
    .from("training_weeks")
    .insert(weeksToInsert)
    .select("id, week_number");

  if (weeksError) throw new Error(weeksError.message);

  const weekIdByNumber = new Map((insertedWeeks ?? []).map((w) => [w.week_number, w.id]));

  const daysToInsert = calendarWeeks.flatMap((calWeek) => {
    const weekId = weekIdByNumber.get(calWeek.weekNumber);
    if (!weekId) return [];
    return calWeek.days.map((day) => ({
      week_id: weekId,
      user_id: user.id,
      day_number: day.dayNumber,
      name: getDayName(day.dayNumber),
      calendar_date: toDateStr(day.date),
    }));
  });

  const { error: daysError } = await supabase
    .from("training_days")
    .insert(daysToInsert);

  if (daysError) throw new Error(daysError.message);

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
