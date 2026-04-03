"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { Plus, CheckCircle2, BarChart2, Dumbbell } from "lucide-react";
import ExerciseCard from "./ExerciseCard";
import AddExerciseSheet from "./AddExerciseSheet";
import { useWorkoutStore } from "@/store/workout.store";
import { markDayComplete } from "@/lib/actions/days";
import { cn, formatVolume } from "@/lib/utils";
import type { DayExerciseWithSets, TrainingDay, Exercise } from "@/types/database";

interface DayWorkoutClientProps {
  day: TrainingDay;
  initialExercises: DayExerciseWithSets[];
  allExercises: Exercise[];
  weekId: string;
  monthId: string;
}

export default function DayWorkoutClient({
  day,
  initialExercises,
  allExercises,
  weekId,
  monthId,
}: DayWorkoutClientProps) {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [isCompletingDay, startCompleteTransition] = useTransition();

  const {
    setActiveDayId,
    loadDayExercises,
    dayExercises,
    activeDayId,
    getTotalVolume,
    getCompletedSetsCount,
    getTotalSetsCount,
  } = useWorkoutStore();

  // Load data into store on mount / when day changes
  useEffect(() => {
    if (activeDayId !== day.id) {
      setActiveDayId(day.id);
      loadDayExercises(initialExercises);
    }
  }, [day.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const exercises = activeDayId === day.id ? dayExercises : initialExercises;
  const totalVolume = getTotalVolume();
  const completedSets = getCompletedSetsCount();
  const totalSets = getTotalSetsCount();
  const hasExercises = exercises.length > 0;

  const handleToggleComplete = () => {
    startCompleteTransition(async () => {
      await markDayComplete(day.id, !day.is_completed, weekId, monthId);
    });
  };

  return (
    <div className="flex flex-col pb-24">
      {/* Day hero */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{day.name}</h1>
          </div>
          <button
            onClick={handleToggleComplete}
            disabled={isCompletingDay}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shrink-0",
              day.is_completed
                ? "bg-emerald-500/15 text-emerald-400"
                : "glass text-slate-400 hover:text-slate-200"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {day.is_completed ? "Completed" : "Mark done"}
          </button>
        </div>

        {/* Stats summary */}
        {hasExercises && (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass">
              <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-slate-300">
                {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
              </span>
            </div>
            {totalSets > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass">
                <BarChart2 className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-medium text-slate-300">
                  {completedSets}/{totalSets} sets
                </span>
              </div>
            )}
            {totalVolume > 0 && (
              <div className="px-3 py-1.5 rounded-xl glass">
                <span className="text-xs font-medium text-slate-300">
                  {formatVolume(totalVolume)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Sets progress bar */}
        {totalSets > 0 && (
          <div className="mt-3">
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedSets / totalSets) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Exercise list */}
      <div className="px-4 flex flex-col gap-3">
        {!hasExercises ? (
          <div className="glass rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">No exercises yet</p>
              <p className="text-xs text-slate-600 mt-0.5">Tap below to add your first exercise</p>
            </div>
          </div>
        ) : (
          exercises.map((de) => (
            <ExerciseCard
              key={de.id}
              dayExercise={de as DayExerciseWithSets & { sets: (DayExerciseWithSets["sets"][number] & { _optimistic?: boolean; _error?: boolean })[] }}
              dayId={day.id}
              weekId={weekId}
              monthId={monthId}
            />
          ))
        )}
      </div>

      {/* Add exercise FAB */}
      <div className="fixed bottom-24 right-4 z-40">
        <button
          onClick={() => setShowAddSheet(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Exercise
        </button>
      </div>

      {/* Add exercise sheet */}
      {showAddSheet && (
        <AddExerciseSheet
          exercises={allExercises}
          dayId={day.id}
          weekId={weekId}
          monthId={monthId}
          onClose={() => setShowAddSheet(false)}
        />
      )}
    </div>
  );
}
