"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { getMonthWithWeeks } from "@/lib/queries/months";
import WeekCard from "@/components/weeks/WeekCard";
import CloneWeekSheet from "@/components/weeks/CloneWeekSheet";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import type { TrainingWeek } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ monthId: string }>;
}

export default async function MonthPage({ params }: PageProps) {
  const { monthId } = await params;
  const data = await getMonthWithWeeks(monthId);
  if (!data) notFound();

  const supabase = await createClient();

  // Fetch days for each week
  const weeksWithDays = await Promise.all(
    data.training_weeks.map(async (week) => {
      const { data: days } = await supabase
        .from("training_days")
        .select("*")
        .eq("week_id", week.id)
        .order("day_number");
      return { week, days: days ?? [] };
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

// ─── Client wrapper (for clone sheet state) ──────────────────

interface MonthPageClientProps {
  monthId: string;
  monthName: string;
  completedWeeks: number;
  totalWeeks: number;
  weeksWithDays: { week: TrainingWeek; days: { is_completed: boolean; is_rest_day: boolean }[] }[];
  allWeeks: TrainingWeek[];
}

function MonthPageClient({
  monthId,
  monthName,
  completedWeeks,
  totalWeeks,
  weeksWithDays,
  allWeeks,
}: MonthPageClientProps) {
  const [cloneSource, setCloneSource] = useState<{ id: string; name: string } | null>(null);

  const overallProgress = totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0;

  return (
    <div className="flex flex-col gap-0">
      {/* Month hero */}
      <div className="px-4 pt-6 pb-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
          Training Month
        </p>
        <h1 className="text-2xl font-bold text-white mb-4">{monthName}</h1>

        {/* Overall progress bar */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium text-slate-300">Monthly Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                {completedWeeks}/{totalWeeks} weeks
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-right text-xs text-slate-500 mt-1">{Math.round(overallProgress)}%</p>
        </div>
      </div>

      {/* Weeks list */}
      <div className="px-4 flex flex-col gap-3 pb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          4 Weeks
        </h2>
        {weeksWithDays.map(({ week, days }) => (
          <WeekCard
            key={week.id}
            week={week}
            days={days as import("@/types/database").TrainingDay[]}
            monthId={monthId}
            onClone={(weekId) =>
              setCloneSource({ id: weekId, name: week.name })
            }
            isCloning={cloneSource?.id === week.id}
          />
        ))}
      </div>

      {/* Clone sheet */}
      {cloneSource && (
        <CloneWeekSheet
          sourceWeekId={cloneSource.id}
          sourceWeekName={cloneSource.name}
          targetWeeks={allWeeks}
          monthId={monthId}
          onClose={() => setCloneSource(null)}
        />
      )}
    </div>
  );
}
