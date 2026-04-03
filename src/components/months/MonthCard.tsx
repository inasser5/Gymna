"use client";

import Link from "next/link";
import { Trash2, ChevronRight, Calendar } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMonth } from "@/lib/actions/months";
import { useBreadcrumbStore } from "@/store/breadcrumb.store";
import ProgressRing from "@/components/ui/ProgressRing";
import type { TrainingMonth } from "@/types/database";

interface MonthCardProps {
  month: TrainingMonth;
  weekCount: number;
  completedWeeks: number;
}

const MONTH_GRADIENTS = [
  "from-indigo-600 to-violet-700",
  "from-blue-600 to-indigo-700",
  "from-violet-600 to-purple-700",
  "from-sky-600 to-blue-700",
];

export default function MonthCard({ month, weekCount, completedWeeks }: MonthCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const setMonth = useBreadcrumbStore((s) => s.setMonth);

  const progress = weekCount > 0 ? completedWeeks / weekCount : 0;
  const gradient = MONTH_GRADIENTS[month.month % MONTH_GRADIENTS.length];

  const handleNavigate = () => {
    setMonth(month.id, month.name);
    router.push(`/month/${month.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${month.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteMonth(month.id);
    });
  };

  return (
    <div
      onClick={handleNavigate}
      className="glass rounded-2xl p-4 flex flex-col gap-3 cursor-pointer active:scale-[0.97] transition-all hover:border-white/15 group relative overflow-hidden"
    >
      {/* Gradient accent top bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} opacity-70`} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
            {month.year}
          </p>
          <h3 className="text-base font-bold text-white truncate leading-tight">
            {month.name.split(" ")[0]}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 transition-all"
            aria-label="Delete month"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </button>

          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </div>
      </div>

      {/* Progress ring + stats */}
      <div className="flex items-center gap-3">
        <ProgressRing progress={progress} size={44} strokeWidth={3}>
          <span className="text-[10px] font-bold text-white">
            {Math.round(progress * 100)}%
          </span>
        </ProgressRing>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-400">
              {weekCount} week{weekCount !== 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {completedWeeks}/{weekCount} done
          </span>
        </div>
      </div>

      {/* Active indicator */}
      {month.is_active && (
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-400">Active</span>
        </div>
      )}
    </div>
  );
}
