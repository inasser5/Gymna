"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useWorkoutStore } from "@/store/workout.store";
import { useRestTimerStore } from "@/store/rest-timer.store";
import { updateSet, deleteSet } from "@/lib/actions/sets";
import { cn } from "@/lib/utils";
import type { ExerciseSet } from "@/types/database";

interface SetRowProps {
  set: ExerciseSet & { _optimistic?: boolean; _error?: boolean };
  dayExerciseId: string;
  restDuration?: number; // seconds
}

export default function SetRow({ set, dayExerciseId, restDuration = 90 }: SetRowProps) {
  const [weight, setWeight] = useState(set.weight != null ? String(set.weight) : "");
  const [reps, setReps] = useState(set.reps != null ? String(set.reps) : "");
  const [isSaving, setIsSaving] = useState(false);

  const { updateSet: storeUpdateSet, toggleSetComplete, removeSet } = useWorkoutStore();
  const { start: startTimer } = useRestTimerStore();

  const handleBlur = async () => {
    const w = weight !== "" ? parseFloat(weight) : null;
    const r = reps !== "" ? parseInt(reps) : null;

    if (w === set.weight && r === set.reps) return;

    storeUpdateSet(dayExerciseId, set.id, { weight: w, reps: r });
    setIsSaving(true);
    try {
      await updateSet(set.id, { weight: w, reps: r });
    } catch {
      // revert on failure
      storeUpdateSet(dayExerciseId, set.id, { weight: set.weight, reps: set.reps });
      setWeight(set.weight != null ? String(set.weight) : "");
      setReps(set.reps != null ? String(set.reps) : "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleComplete = async () => {
    const newCompleted = !set.is_completed;
    toggleSetComplete(dayExerciseId, set.id);
    if (newCompleted) startTimer(restDuration);
    try {
      await updateSet(set.id, { is_completed: newCompleted });
    } catch {
      toggleSetComplete(dayExerciseId, set.id); // revert
    }
  };

  const handleDelete = async () => {
    removeSet(dayExerciseId, set.id);
    try {
      await deleteSet(set.id);
    } catch {
      // silently fail — next page load will restore from DB
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
        set.is_completed && "bg-emerald-500/8",
        set._optimistic && "opacity-60",
        set._error && "bg-rose-500/10"
      )}
    >
      {/* Set number */}
      <span className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
        set.is_completed ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-slate-500"
      )}>
        {set.set_number}
      </span>

      {/* Weight input */}
      <div className="flex items-center gap-1 flex-1">
        <input
          type="number"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={handleBlur}
          placeholder="0"
          className={cn(
            "w-16 bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-sm text-white text-center",
            "focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all",
            set.is_completed && "text-emerald-300"
          )}
        />
        <span className="text-[10px] text-slate-600 font-medium">kg</span>
      </div>

      <span className="text-slate-700 text-xs">×</span>

      {/* Reps input */}
      <div className="flex items-center gap-1 flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onBlur={handleBlur}
          placeholder="0"
          className={cn(
            "w-14 bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-sm text-white text-center",
            "focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all",
            set.is_completed && "text-emerald-300"
          )}
        />
        <span className="text-[10px] text-slate-600 font-medium">reps</span>
      </div>

      {/* Complete toggle */}
      <button
        onClick={handleToggleComplete}
        disabled={isSaving}
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0",
          set.is_completed
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
            : "bg-white/5 border border-white/10 text-slate-600 hover:border-emerald-500/40 hover:text-emerald-400"
        )}
      >
        <Check className="w-3.5 h-3.5" />
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-90 shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
