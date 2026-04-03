import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMonthWithWeeks } from "@/lib/queries/months";
import MonthPageClient from "./MonthPageClient";
import type { TrainingDay, TrainingWeek } from "@/types/database";

interface PageProps {
  params: Promise<{ monthId: string }>;
}

export default async function MonthPage({ params }: PageProps) {
  const { monthId } = await params;
  const data = await getMonthWithWeeks(monthId);
  if (!data) notFound();

  const supabase = await createClient();

  const weeksWithDays = await Promise.all(
    data.training_weeks.map(async (week) => {
      const { data: days } = await supabase
        .from("training_days")
        .select("*")
        .eq("week_id", week.id)
        .order("day_number");
      return { week, days: (days ?? []) as TrainingDay[] };
    })
  );

  const completedWeeks = data.training_weeks.filter((w) => w.is_completed).length;
  const totalWeeks = data.training_weeks.length;

  return (
    <MonthPageClient
      monthId={monthId}
      monthName={data.name}
      completedWeeks={completedWeeks}
      totalWeeks={totalWeeks}
      weeksWithDays={weeksWithDays}
      allWeeks={data.training_weeks}
    />
  );
}
