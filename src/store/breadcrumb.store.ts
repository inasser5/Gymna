"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface BreadcrumbContext {
  monthId: string | null;
  monthName: string | null;
  weekId: string | null;
  weekName: string | null;
  dayId: string | null;
  dayName: string | null;
  exerciseId: string | null;
  exerciseName: string | null;
}

interface BreadcrumbState extends BreadcrumbContext {
  // Setters
  setMonth: (id: string, name: string) => void;
  setWeek: (id: string, name: string) => void;
  setDay: (id: string, name: string) => void;
  setExercise: (id: string, name: string) => void;
  // Navigate up — clears everything below the given level
  clearBelow: (level: "month" | "week" | "day") => void;
  // Full reset
  reset: () => void;
  // Computed
  getBreadcrumbs: () => BreadcrumbItem[];
}

const initialContext: BreadcrumbContext = {
  monthId: null,
  monthName: null,
  weekId: null,
  weekName: null,
  dayId: null,
  dayName: null,
  exerciseId: null,
  exerciseName: null,
};

// ─── Store ───────────────────────────────────────────────────

export const useBreadcrumbStore = create<BreadcrumbState>()(
  persist(
    (set, get) => ({
      ...initialContext,

      setMonth: (id, name) =>
        set({
          monthId: id,
          monthName: name,
          // Clear everything below
          weekId: null,
          weekName: null,
          dayId: null,
          dayName: null,
          exerciseId: null,
          exerciseName: null,
        }),

      setWeek: (id, name) =>
        set({
          weekId: id,
          weekName: name,
          dayId: null,
          dayName: null,
          exerciseId: null,
          exerciseName: null,
        }),

      setDay: (id, name) =>
        set({
          dayId: id,
          dayName: name,
          exerciseId: null,
          exerciseName: null,
        }),

      setExercise: (id, name) =>
        set({ exerciseId: id, exerciseName: name }),

      clearBelow: (level) => {
        if (level === "month") {
          set({
            weekId: null,
            weekName: null,
            dayId: null,
            dayName: null,
            exerciseId: null,
            exerciseName: null,
          });
        } else if (level === "week") {
          set({
            dayId: null,
            dayName: null,
            exerciseId: null,
            exerciseName: null,
          });
        } else {
          set({ exerciseId: null, exerciseName: null });
        }
      },

      reset: () => set(initialContext),

      getBreadcrumbs: (): BreadcrumbItem[] => {
        const { monthId, monthName, weekId, weekName, dayId, dayName, exerciseName } =
          get();
        const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

        if (monthId && monthName) {
          crumbs.push({ label: monthName, href: `/month/${monthId}` });
        }
        if (weekId && weekName) {
          crumbs.push({ label: weekName, href: `/month/${get().monthId}/week/${weekId}` });
        }
        if (dayId && dayName) {
          crumbs.push({
            label: dayName,
            href: `/month/${get().monthId}/week/${weekId}/day/${dayId}`,
          });
        }
        if (exerciseName) {
          crumbs.push({ label: exerciseName, href: "#" });
        }

        return crumbs;
      },
    }),
    {
      name: "gymna-breadcrumb",
      partialize: (state) => ({
        monthId: state.monthId,
        monthName: state.monthName,
        weekId: state.weekId,
        weekName: state.weekName,
        dayId: state.dayId,
        dayName: state.dayName,
        exerciseId: state.exerciseId,
        exerciseName: state.exerciseName,
      }),
    }
  )
);
