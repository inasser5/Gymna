import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWeekWithDays } from "@/lib/queries/weeks";
import DayCard from "@/components/days/DayCard";
import { createWeekDays } from "@/lib/actions/weeks";
import { CheckCircle2, Plus } from "lucide-react";

interface PageProps {
  params: Promise<{ monthId: string; weekId: string }>;
}

export default async function WeekPage({ params }: PageProps) {
  const { monthId, weekId } = await params;
  const supabase = await createClient();

  // Single query: week + days + exercises + sets
  const [weekData, exerciseData] = await Promise.all([
    getWeekWithDays(weekId),
    supabase
      .from("training_days")
      .select("id, day_exercises(id, exercise_sets(is_completed, weight, reps))")
      .eq("week_id", weekId),
  ]);

  if (!weekData) notFound();

  const statsMap = new Map(
    (exerciseData.data ?? []).map((day) => {
      const exercises = day.day_exercises ?? [];
      const sets = exercises.flatMap((e: { id: string; exercise_sets: { is_completed: boolean; weight: number | null; reps: number | null }[] }) => e.exercise_sets ?? []);
      return [day.id, {
        exerciseCount: exercises.length,
        totalSets: sets.length,
        completedSets: sets.filter((s) => s.is_completed).length,
        volume: sets
          .filter((s) => s.is_completed && s.weight && s.reps)
          .reduce((acc, s) => acc + (s.weight ?? 0) * (s.reps ?? 0), 0),
      }];
    })
  );

  const daysWithStats = weekData.training_days.map((day) => ({
    day,
    ...(statsMap.get(day.id) ?? { exerciseCount: 0, totalSets: 0, completedSets: 0, volume: 0 }),
  }));

  const hasDays = weekData.training_days.length > 0;
  const completedDays = weekData.training_days.filter((d) => d.is_completed).length;

  return (
    <div className="flex flex-col">
      {/* Week hero */}
      <div className="px-4 pt-6 pb-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
          Week {weekData.week_number}
        </p>
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">{weekData.name}</h1>
          {weekData.is_completed && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">Completed</span>
            </div>
          )}
        </div>

        {hasDays && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500">{completedDays} of {weekData.training_days.length} days done</span>
              <span className="text-xs text-slate-500">
                {Math.round((completedDays / weekData.training_days.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${(completedDays / weekData.training_days.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Days or empty state */}
      <div className="px-4 flex flex-col gap-3 pb-4">
        {!hasDays ? (
          <div className="glass rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-slate-400">No days set up for this week yet.</p>
            <form
              action={async () => {
                "use server";
                await createWeekDays(weekId, monthId);
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Generate 7 Days
              </button>
            </form>
          </div>
        ) : (
          <>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              7 Days
            </h2>
            {daysWithStats.map(({ day, exerciseCount, completedSets, totalSets, volume }) => (
              <DayCard
                key={day.id}
                day={day}
                weekId={weekId}
                monthId={monthId}
                exerciseCount={exerciseCount}
                completedSets={completedSets}
                totalSets={totalSets}
                volume={volume}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
