"use client";

import { create } from "zustand";
import type { ExerciseSet, DayExercise, DayExerciseWithSets } from "@/types/database";

// ─── Types ───────────────────────────────────────────────────

type OptimisticSet = ExerciseSet & { _optimistic?: boolean; _error?: boolean };

interface WorkoutState {
  // Active day context
  activeDayId: string | null;
  dayExercises: DayExerciseWithSets[];

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Actions — Day
  setActiveDayId: (dayId: string | null) => void;
  loadDayExercises: (exercises: DayExerciseWithSets[]) => void;

  // Actions — Exercise
  addExercise: (exercise: DayExercise) => void;
  updateExerciseDisplayName: (dayExerciseId: string, displayName: string) => void;
  removeExercise: (dayExerciseId: string) => void;
  reorderExercises: (dayExercises: DayExerciseWithSets[]) => void;

  // Actions — Set (optimistic)
  addSet: (dayExerciseId: string, set: ExerciseSet) => void;
  updateSet: (dayExerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
  toggleSetComplete: (dayExerciseId: string, setId: string) => void;
  removeSet: (dayExerciseId: string, setId: string) => void;

  // Optimistic rollback
  markSetError: (dayExerciseId: string, setId: string) => void;
  confirmSet: (dayExerciseId: string, tempId: string, confirmedSet: ExerciseSet) => void;

  // Selectors
  getSetsForExercise: (dayExerciseId: string) => OptimisticSet[];
  getTotalVolume: () => number;
  getCompletedSetsCount: () => number;
  getTotalSetsCount: () => number;
}

// ─── Store ───────────────────────────────────────────────────

export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
  activeDayId: null,
  dayExercises: [],
  isLoading: false,
  isSaving: false,

  // ── Day ────────────────────────────────────────────────────

  setActiveDayId: (dayId) => set({ activeDayId: dayId }),

  loadDayExercises: (exercises) =>
    set({ dayExercises: exercises, isLoading: false }),

  // ── Exercise ───────────────────────────────────────────────

  addExercise: (exercise) =>
    set((state) => ({
      dayExercises: [
        ...state.dayExercises,
        { ...exercise, sets: [] },
      ],
    })),

  updateExerciseDisplayName: (dayExerciseId, displayName) =>
    set((state) => ({
      dayExercises: state.dayExercises.map((de) =>
        de.id === dayExerciseId ? { ...de, display_name: displayName } : de
      ),
    })),

  removeExercise: (dayExerciseId) =>
    set((state) => ({
      dayExercises: state.dayExercises.filter((de) => de.id !== dayExerciseId),
    })),

  reorderExercises: (dayExercises) => set({ dayExercises }),

  // ── Set ────────────────────────────────────────────────────

  addSet: (dayExerciseId, newSet) =>
    set((state) => ({
      dayExercises: state.dayExercises.map((de) =>
        de.id === dayExerciseId
          ? { ...de, sets: [...de.sets, { ...newSet, _optimistic: true }] }
          : de
      ),
    })),

  updateSet: (dayExerciseId, setId, updates) =>
    set((state) => ({
      dayExercises: state.dayExercises.map((de) =>
        de.id === dayExerciseId
          ? {
              ...de,
              sets: de.sets.map((s) =>
                s.id === setId ? { ...s, ...updates } : s
              ),
            }
          : de
      ),
    })),

  toggleSetComplete: (dayExerciseId, setId) =>
    set((state) => ({
      dayExercises: state.dayExercises.map((de) =>
        de.id === dayExerciseId
          ? {
              ...de,
              sets: de.sets.map((s) =>
                s.id === setId ? { ...s, is_completed: !s.is_completed } : s
              ),
            }
          : de
      ),
    })),

  removeSet: (dayExerciseId, setId) =>
    set((state) => ({
      dayExercises: state.dayExercises.map((de) =>
        de.id === dayExerciseId
          ? { ...de, sets: de.sets.filter((s) => s.id !== setId) }
          : de
      ),
    })),

  markSetError: (dayExerciseId, setId) =>
    set((state) => ({
      dayExercises: state.dayExercises.map((de) =>
        de.id === dayExerciseId
          ? {
              ...de,
              sets: de.sets.map((s) =>
                s.id === setId ? { ...s, _error: true, _optimistic: false } : s
              ),
            }
          : de
      ),
    })),

  // Replace temp optimistic ID with real DB ID after insert confirms
  confirmSet: (dayExerciseId, tempId, confirmedSet) =>
    set((state) => ({
      dayExercises: state.dayExercises.map((de) =>
        de.id === dayExerciseId
          ? {
              ...de,
              sets: de.sets.map((s) =>
                s.id === tempId
                  ? { ...confirmedSet, _optimistic: false, _error: false }
                  : s
              ),
            }
          : de
      ),
    })),

  // ── Selectors ──────────────────────────────────────────────

  getSetsForExercise: (dayExerciseId) => {
    const exercise = get().dayExercises.find((de) => de.id === dayExerciseId);
    return (exercise?.sets as OptimisticSet[]) ?? [];
  },

  getTotalVolume: () =>
    get().dayExercises.reduce((total, de) => {
      const vol = de.sets
        .filter((s) => s.is_completed && s.weight != null && s.reps != null)
        .reduce((acc, s) => acc + (s.weight ?? 0) * (s.reps ?? 0), 0);
      return total + vol;
    }, 0),

  getCompletedSetsCount: () =>
    get().dayExercises.reduce(
      (total, de) => total + de.sets.filter((s) => s.is_completed).length,
      0
    ),

  getTotalSetsCount: () =>
    get().dayExercises.reduce((total, de) => total + de.sets.length, 0),
}));
