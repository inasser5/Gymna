"use client";

import { useState, useRef, useTransition } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import SetRow from "./SetRow";
import { useWorkoutStore } from "@/store/workout.store";
import { addSet } from "@/lib/actions/sets";
import { removeExerciseFromDay, updateDisplayName } from "@/lib/actions/exercises";
import { cn } from "@/lib/utils";
import type { DayExerciseWithSets } from "@/types/database";

interface ExerciseCardProps {
  dayExercise: DayExerciseWithSets & { sets: (DayExerciseWithSets["sets"][number] & { _optimistic?: boolean; _error?: boolean })[] };
  dayId: string;
  weekId: string;
  monthId: string;
}

export default function ExerciseCard({ dayExercise, dayId, weekId, monthId }: ExerciseCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(dayExercise.display_name);
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [isRemoving, startRemoveTransition] = useTransition();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    addSet: storeAddSet,
    confirmSet,
    markSetError,
    removeExercise,
    updateExerciseDisplayName,
  } = useWorkoutStore();

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === dayExercise.display_name) {
      setNameValue(dayExercise.display_name);
      setIsEditingName(false);
      return;
    }
    updateExerciseDisplayName(dayExercise.id, trimmed);
    setIsEditingName(false);
    try {
      await updateDisplayName(dayExercise.id, trimmed, dayId, weekId, monthId);
    } catch {
      updateExerciseDisplayName(dayExercise.id, dayExercise.display_name);
      setNameValue(dayExercise.display_name);
    }
  };

  const handleAddSet = async () => {
    setIsAddingSet(true);
    const tempId = `temp-${Date.now()}`;
    const nextSetNumber = dayExercise.sets.length + 1;

    const optimisticSet = {
      id: tempId,
      day_exercise_id: dayExercise.id,
      user_id: "",
      set_number: nextSetNumber,
      reps: null,
      weight: null,
      weight_unit: "kg" as const,
      is_completed: false,
      rpe: null,
      created_at: new Date().toISOString(),
    };

    storeAddSet(dayExercise.id, optimisticSet);

    try {
      const confirmed = await addSet(dayExercise.id, nextSetNumber);
      confirmSet(dayExercise.id, tempId, confirmed);
    } catch {
      markSetError(dayExercise.id, tempId);
    } finally {
      setIsAddingSet(false);
    }
  };

  const handleRemoveExercise = () => {
    startRemoveTransition(async () => {
      removeExercise(dayExercise.id);
      try {
        await removeExerciseFromDay(dayExercise.id, dayId, weekId, monthId);
      } catch {
        // page refresh will restore
      }
    });
  };

  const muscleGroup = dayExercise.exercise?.muscle_group;

  return (
    <div className={cn(
      "glass rounded-2xl overflow-hidden transition-all",
      isRemoving && "opacity-50 pointer-events-none"
    )}>
      {/* Exercise header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setNameValue(dayExercise.display_name);
                    setIsEditingName(false);
                  }
                }}
                className="flex-1 bg-white/8 border border-indigo-500/40 rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none"
                autoFocus
              />
              <button onClick={handleSaveName} className="text-emerald-400 active:scale-90">
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setNameValue(dayExercise.display_name); setIsEditingName(false); }}
                className="text-slate-500 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-1.5 group text-left"
            >
              <h3 className="text-sm font-bold text-white truncate">{dayExercise.display_name}</h3>
              <Pencil className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
            </button>
          )}
          {muscleGroup && (
            <p className="text-[10px] text-slate-600 mt-0.5 font-medium uppercase tracking-wider">
              {muscleGroup}
            </p>
          )}
        </div>

        <button
          onClick={handleRemoveExercise}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-90 ml-2 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Column headers */}
      {dayExercise.sets.length > 0 && (
        <div className="flex items-center gap-2 px-3 mb-1">
          <span className="w-6 shrink-0" />
          <span className="flex-1 text-[10px] text-slate-700 text-center font-medium uppercase tracking-wider">Weight</span>
          <span className="w-3 shrink-0" />
          <span className="flex-1 text-[10px] text-slate-700 text-center font-medium uppercase tracking-wider">Reps</span>
          <span className="w-8 shrink-0" />
          <span className="w-7 shrink-0" />
        </div>
      )}

      {/* Set rows */}
      <div className="pb-2">
        {dayExercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            dayExerciseId={dayExercise.id}
          />
        ))}
      </div>

      {/* Add set button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddSet}
          disabled={isAddingSet}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/10 text-slate-600 hover:text-slate-400 hover:border-white/20 transition-all active:scale-[0.98] disabled:opacity-50 text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Set
        </button>
      </div>
    </div>
  );
}
