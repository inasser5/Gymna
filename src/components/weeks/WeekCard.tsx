"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCircle2, ChevronRight, Copy, Dumbbell, Moon } from "lucide-react";
import { useBreadcrumbStore } from "@/store/breadcrumb.store";
import { markWeekComplete } from "@/lib/actions/weeks";
import ProgressRing from "@/components/ui/ProgressRing";
import { cn, formatShortDate } from "@/lib/utils";
import type { TrainingWeek, TrainingDay } from "@/types/database";

interface WeekCardProps {
  week: TrainingWeek;
  days: TrainingDay[];
  monthId: string;
  onClone: (weekId: string) => void;
  isCloning: boolean;
}

export default function WeekCard({ week, days, monthId, onClone, isCloning }: WeekCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const setWeek = useBreadcrumbStore((s) => s.setWeek);

  const completedDays = days.filter((d) => d.is_completed).length;
  const restDays = days.filter((d) => d.is_rest_day).length;
  const trainingDays = days.length - restDays;
  const progress = days.length > 0 ? completedDays / days.length : 0;

  const handleNavigate = () => {
    setWeek(week.id, week.name);
    router.push(`/month/${monthId}/week/${week.id}`);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await markWeekComplete(week.id, monthId, !week.is_completed);
    });
  };

  return (
    <div
      onClick={handleNavigate}
      className={cn(
        "glass rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all hover:border-white/15 group relative overflow-hidden",
        week.is_completed && "border-emerald-500/20"
      )}
    >
      {/* Completed shimmer */}
      {week.is_completed && (
        <div className="absolute inset-0 bg-emerald-500/3 pointer-events-none" />
      )}

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Week {week.week_number}
          </p>
          <h3 className="text-base font-bold text-white">{week.name}</h3>
          {week.start_date && days.length > 0 && (() => {
            const lastDay = [...days].reverse().find(d => d.calendar_date);
            return (
              <p className="text-[10px] text-slate-600 mt-0.5">
                {formatShortDate(week.start_date!)} – {lastDay?.calendar_date ? formatShortDate(lastDay.calendar_date) : ''}
              </p>
            );
          })()}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
      </div>

      {/* Progress + day stats */}
      <div className="flex items-center gap-3 mb-3">
        <ProgressRing progress={progress} size={40} strokeWidth={3}
          color={week.is_completed ? "#10b981" : "#6366f1"}
        >
          <span className="text-[9px] font-bold text-white">
            {completedDays}/{days.length}
          </span>
        </ProgressRing>

        <div className="flex flex-col gap-0.5">
          {trainingDays > 0 && (
            <div className="flex items-center gap-1">
              <Dumbbell className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-slate-400">{trainingDays} training</span>
            </div>
          )}
          {restDays > 0 && (
            <div className="flex items-center gap-1">
              <Moon className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">{restDays} rest</span>
            </div>
          )}
          {days.length === 0 && (
            <span className="text-xs text-slate-600">No days yet</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {/* Clone button */}
        <button
          onClick={() => onClone(week.id)}
          disabled={isCloning}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass hover:bg-white/10 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <Copy className="w-3 h-3" />
          Clone
        </button>

        {/* Complete toggle */}
        <button
          onClick={handleToggleComplete}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-50",
            week.is_completed
              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
              : "glass hover:bg-white/10 text-slate-400 hover:text-slate-200"
          )}
        >
          <CheckCircle2 className="w-3 h-3" />
          {week.is_completed ? "Done" : "Mark done"}
        </button>
      </div>
    </div>
  );
}
