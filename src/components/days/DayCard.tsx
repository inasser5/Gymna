"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCircle2, Moon, Dumbbell, ChevronRight, BarChart2 } from "lucide-react";
import { useBreadcrumbStore } from "@/store/breadcrumb.store";
import { markDayComplete, toggleRestDay } from "@/lib/actions/days";
import { cn, getDayName, formatShortDate } from "@/lib/utils";
import type { TrainingDay } from "@/types/database";

interface DayCardProps {
  day: TrainingDay;
  weekId: string;
  monthId: string;
  exerciseCount?: number;
  completedSets?: number;
  totalSets?: number;
  volume?: number;
}

const DAY_COLORS = [
  "from-indigo-500/20 to-violet-500/20",
  "from-blue-500/20 to-indigo-500/20",
  "from-violet-500/20 to-purple-500/20",
  "from-sky-500/20 to-blue-500/20",
  "from-indigo-500/20 to-sky-500/20",
  "from-slate-500/20 to-slate-600/20",
  "from-slate-500/20 to-slate-600/20",
];

export default function DayCard({
  day,
  weekId,
  monthId,
  exerciseCount = 0,
  completedSets = 0,
  totalSets = 0,
  volume = 0,
}: DayCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const setDay = useBreadcrumbStore((s) => s.setDay);

  const dayName = day.calendar_date
    ? new Date(
        Number(day.calendar_date.split('-')[0]),
        Number(day.calendar_date.split('-')[1]) - 1,
        Number(day.calendar_date.split('-')[2])
      ).toLocaleDateString('en-US', { weekday: 'long' })
    : getDayName(day.day_number);

  const dateLabel = day.calendar_date ? formatShortDate(day.calendar_date) : null;

  const gradient = DAY_COLORS[day.day_number - 1] ?? DAY_COLORS[0];

  const handleNavigate = () => {
    if (day.is_rest_day) return;
    setDay(day.id, day.name || dayName);
    router.push(`/month/${monthId}/week/${weekId}/day/${day.id}`);
  };

  const handleToggleRest = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await toggleRestDay(day.id, !day.is_rest_day, weekId, monthId);
    });
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await markDayComplete(day.id, !day.is_completed, weekId, monthId);
    });
  };

  return (
    <div
      onClick={handleNavigate}
      className={cn(
        "glass rounded-2xl p-4 transition-all group relative overflow-hidden",
        !day.is_rest_day && "cursor-pointer active:scale-[0.98] hover:border-white/15",
        day.is_completed && "border-emerald-500/20",
        day.is_rest_day && "opacity-60"
      )}
    >
      {/* Day gradient bg */}
      {!day.is_rest_day && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30 pointer-events-none`} />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {dayName}
            </p>
            {dateLabel && (
              <p className="text-xs font-medium text-slate-400">{dateLabel}</p>
            )}
            <h3 className={cn(
              "text-sm font-bold leading-tight",
              day.is_rest_day ? "text-slate-500" : "text-white"
            )}>
              {day.name || (day.is_rest_day ? "Rest Day" : "Training Day")}
            </h3>
          </div>

          {!day.is_rest_day && (
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors mt-0.5" />
          )}
        </div>

        {/* Stats */}
        {!day.is_rest_day && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
            {exerciseCount > 0 && (
              <div className="flex items-center gap-1">
                <Dumbbell className="w-3 h-3 text-indigo-400" />
                <span className="text-xs text-slate-400">{exerciseCount} exercises</span>
              </div>
            )}
            {totalSets > 0 && (
              <div className="flex items-center gap-1">
                <BarChart2 className="w-3 h-3 text-violet-400" />
                <span className="text-xs text-slate-400">{completedSets}/{totalSets} sets</span>
              </div>
            )}
            {volume > 0 && (
              <span className="text-xs text-slate-500">
                {volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume.toFixed(0)} kg
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Rest toggle */}
          <button
            onClick={handleToggleRest}
            disabled={isPending}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-50",
              day.is_rest_day
                ? "bg-slate-500/20 text-slate-400"
                : "glass hover:bg-white/10 text-slate-500 hover:text-slate-300"
            )}
          >
            <Moon className="w-3 h-3" />
            {day.is_rest_day ? "Rest" : "Set rest"}
          </button>

          {/* Complete toggle */}
          {!day.is_rest_day && (
            <button
              onClick={handleToggleComplete}
              disabled={isPending}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-50",
                day.is_completed
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "glass hover:bg-white/10 text-slate-400 hover:text-slate-200"
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              {day.is_completed ? "Done" : "Done?"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
