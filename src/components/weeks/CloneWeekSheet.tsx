"use client";

import { useState, useTransition } from "react";
import { Copy, X, Loader2, ChevronRight } from "lucide-react";
import { cloneWeek } from "@/lib/actions/weeks";
import type { TrainingWeek } from "@/types/database";

interface CloneWeekSheetProps {
  sourceWeekId: string;
  sourceWeekName: string;
  targetWeeks: TrainingWeek[];
  monthId: string;
  onClose: () => void;
}

export default function CloneWeekSheet({
  sourceWeekId,
  sourceWeekName,
  targetWeeks,
  monthId,
  onClose,
}: CloneWeekSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleClone = (targetWeekId: string, targetWeekName: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await cloneWeek(sourceWeekId, targetWeekId, monthId);
        setDone(true);
        setTimeout(onClose, 800);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Clone failed");
      }
    });
  };

  const available = targetWeeks.filter((w) => w.id !== sourceWeekId);

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full glass-strong rounded-t-3xl p-6 safe-bottom">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Clone Week</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-5">
          Copy all exercises & sets from <span className="text-slate-300 font-medium">{sourceWeekName}</span> into:
        </p>

        {done ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-2">
              <Copy className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-400">Cloned successfully!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {available.map((week) => (
              <button
                key={week.id}
                onClick={() => handleClone(week.id, week.name)}
                disabled={isPending}
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <span className="text-sm font-medium text-slate-200">{week.name}</span>
                {isPending ? (
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>
            ))}

            {available.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                No other weeks to clone into.
              </p>
            )}

            {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
