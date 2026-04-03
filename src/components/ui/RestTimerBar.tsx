"use client";

import { useEffect, useState, useCallback } from "react";
import { Timer, X, Play, RotateCcw } from "lucide-react";
import { useRestTimerStore } from "@/store/rest-timer.store";
import { cn } from "@/lib/utils";

export default function RestTimerBar() {
  const { isActive, durationSeconds, stop, start, getRemainingSeconds, getProgress } =
    useRestTimerStore();

  const [, forceUpdate] = useState(0);
  const tick = useCallback(() => forceUpdate((n) => n + 1), []);

  // Tick every second when active
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isActive, tick]);

  if (!isActive) return null;

  const remaining = getRemainingSeconds();
  const progress = getProgress();
  const isFinished = remaining === 0;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div
      className={cn(
        "fixed left-4 right-4 bottom-20 z-50 rounded-2xl overflow-hidden transition-all duration-300",
        "glass-strong shadow-2xl",
        isFinished && "ring-2 ring-emerald-500/60"
      )}
    >
      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear rounded-full",
            isFinished ? "bg-emerald-500" : "bg-indigo-500"
          )}
          style={{ width: `${(1 - progress) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
            isFinished ? "bg-emerald-500/20" : "bg-indigo-500/20"
          )}
        >
          <Timer
            className={cn(
              "w-4 h-4",
              isFinished ? "text-emerald-400" : "text-indigo-400",
              !isFinished && "animate-pulse"
            )}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-medium">
            {isFinished ? "Rest complete!" : "Rest timer"}
          </p>
          <p
            className={cn(
              "text-lg font-bold tabular-nums leading-tight",
              isFinished ? "text-emerald-400" : "text-white"
            )}
          >
            {isFinished ? "Ready to go!" : display}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Restart */}
          <button
            onClick={() => start(durationSeconds)}
            className="w-8 h-8 rounded-xl glass hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
            aria-label="Restart timer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Add 30s */}
          {!isFinished && (
            <button
              onClick={() => start(durationSeconds + 30)}
              className="px-2 h-8 rounded-xl glass hover:bg-white/10 flex items-center justify-center text-xs font-semibold text-slate-400 transition-all active:scale-95"
              aria-label="Add 30 seconds"
            >
              +30s
            </button>
          )}

          {/* Close */}
          <button
            onClick={stop}
            className="w-8 h-8 rounded-xl glass hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
            aria-label="Stop timer"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
