"use client";

import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────

interface RestTimerState {
  // Timer identity
  isActive: boolean;
  durationSeconds: number;        // total rest duration set by user
  startedAtMs: number | null;     // epoch ms — survives navigation

  // Actions
  start: (durationSeconds: number) => void;
  stop: () => void;
  reset: () => void;

  // Computed (derive remaining time from startedAtMs — no interval in store)
  getElapsedSeconds: () => number;
  getRemainingSeconds: () => number;
  getProgress: () => number;       // 0–1 (1 = finished)
  isFinished: () => boolean;
}

// ─── Store ───────────────────────────────────────────────────
// NOTE: Uses absolute startedAtMs (epoch) so the timer remains
// accurate across page navigations without any interval in the store.
// Components subscribe via a useInterval hook and call getRemaining().

export const useRestTimerStore = create<RestTimerState>()((set, get) => ({
  isActive: false,
  durationSeconds: 90,
  startedAtMs: null,

  start: (durationSeconds) =>
    set({
      isActive: true,
      durationSeconds,
      startedAtMs: Date.now(),
    }),

  stop: () =>
    set({
      isActive: false,
      startedAtMs: null,
    }),

  reset: () =>
    set({
      isActive: false,
      startedAtMs: null,
    }),

  getElapsedSeconds: () => {
    const { startedAtMs } = get();
    if (!startedAtMs) return 0;
    return Math.floor((Date.now() - startedAtMs) / 1000);
  },

  getRemainingSeconds: () => {
    const { durationSeconds, startedAtMs } = get();
    if (!startedAtMs) return durationSeconds;
    const elapsed = Math.floor((Date.now() - startedAtMs) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  },

  getProgress: () => {
    const { durationSeconds } = get();
    if (durationSeconds === 0) return 1;
    const elapsed = get().getElapsedSeconds();
    return Math.min(1, elapsed / durationSeconds);
  },

  isFinished: () => get().getRemainingSeconds() === 0 && get().isActive,
}));
