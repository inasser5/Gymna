"use client";

import { useState } from "react";
import WeekCard from "@/components/weeks/WeekCard";
import CloneWeekSheet from "@/components/weeks/CloneWeekSheet";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import type { TrainingDay, TrainingWeek } from "@/types/database";

interface MonthPageClientProps {
  monthId: string;
  monthName: string;
  completedWeeks: number;
  totalWeeks: number;
  weeksWithDays: { week: TrainingWeek; days: TrainingDay[] }[];
  allWeeks: TrainingWeek[];
}

export default function MonthPageClient({
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
          {totalWeeks} Week{totalWeeks !== 1 ? 's' : ''}
        </h2>
        {weeksWithDays.map(({ week, days }) => (
          <WeekCard
            key={week.id}
            week={week}
            days={days}
            monthId={monthId}
            onClone={(weekId) => setCloneSource({ id: weekId, name: week.name })}
            isCloning={cloneSource?.id === week.id}
          />
        ))}
      </div>

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
