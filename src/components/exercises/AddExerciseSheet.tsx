"use client";

import { useState, useMemo, useTransition } from "react";
import { Search, X, Plus, Loader2, Dumbbell } from "lucide-react";
import { addExerciseToDay } from "@/lib/actions/exercises";
import { useWorkoutStore } from "@/store/workout.store";
import { cn } from "@/lib/utils";
import type { Exercise, DayExercise } from "@/types/database";

interface AddExerciseSheetProps {
  exercises: Exercise[];
  dayId: string;
  weekId: string;
  monthId: string;
  onClose: () => void;
}

const MUSCLE_ORDER = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Legs", "Glutes", "Core", "Cardio", "Full Body", "Other",
];

export default function AddExerciseSheet({
  exercises,
  dayId,
  weekId,
  monthId,
  onClose,
}: AddExerciseSheetProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<string | null>(null);
  const addExercise = useWorkoutStore((s) => s.addExercise);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q
      ? exercises.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.muscle_group.toLowerCase().includes(q)
        )
      : exercises;
  }, [exercises, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Exercise[]>();
    for (const ex of filtered) {
      const group = ex.muscle_group || "Other";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(ex);
    }
    // Sort groups by MUSCLE_ORDER
    return [...map.entries()].sort(([a], [b]) => {
      const ai = MUSCLE_ORDER.indexOf(a);
      const bi = MUSCLE_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [filtered]);

  const handleAdd = (exercise: Exercise) => {
    setAddingId(exercise.id);
    startTransition(async () => {
      try {
        const newDayExercise: DayExercise = await addExerciseToDay(
          dayId,
          exercise.id,
          weekId,
          monthId
        );
        addExercise(newDayExercise);
        onClose();
      } catch {
        setAddingId(null);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full glass-strong rounded-t-3xl flex flex-col safe-bottom max-h-[85vh]">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Add Exercise</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 mb-3 shrink-0">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 px-5 pb-4">
          {grouped.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">No exercises found.</p>
          )}

          {grouped.map(([group, exs]) => (
            <div key={group} className="mb-4">
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
                {group}
              </p>
              <div className="flex flex-col gap-1">
                {exs.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleAdd(exercise)}
                    disabled={isPending}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl glass",
                      "hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50 text-left"
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">{exercise.name}</p>
                      {exercise.equipment && (
                        <p className="text-[11px] text-slate-600 mt-0.5">{exercise.equipment}</p>
                      )}
                    </div>
                    {addingId === exercise.id && isPending ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
