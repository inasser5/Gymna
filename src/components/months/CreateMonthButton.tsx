"use client";

import { useState, useTransition } from "react";
import { Plus, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { createMonth } from "@/lib/actions/months";
import { getMonthName } from "@/lib/utils";

export default function CreateMonthButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createMonth(year, month);
        setOpen(false);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to create month";
        setError(msg.includes("unique") ? "This month already exists." : msg);
      }
    });
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-sm font-semibold text-white glow-accent shadow-lg shadow-indigo-500/25"
      >
        <Plus className="w-4 h-4" />
        New Month
      </button>

      {/* Bottom Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full glass-strong rounded-t-3xl flex flex-col safe-bottom">
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 mb-4 shrink-0">
              <h2 className="text-lg font-bold text-white">New Training Month</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl glass flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Month Picker */}
            <div className="mx-5 glass rounded-2xl p-4 mb-3 shrink-0">
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
                Select Month
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={prevMonth}
                  className="w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-300" />
                </button>

                <div className="text-center">
                  <p className="text-xl font-bold text-white">{getMonthName(month)}</p>
                  <p className="text-sm text-slate-400">{year}</p>
                </div>

                <button
                  onClick={nextMonth}
                  className="w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center active:scale-95 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Info + error */}
            <p className="text-xs text-slate-500 text-center mb-2 shrink-0">
              4 weeks will be created automatically
            </p>
            {error && (
              <p className="text-xs text-rose-400 text-center mb-2 shrink-0">{error}</p>
            )}

            {/* Create button — always visible */}
            <div className="px-5 pb-5 pt-2 shrink-0">
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                ) : (
                  <><Plus className="w-4 h-4" /> Create {getMonthName(month)} {year}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
