import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/user";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";

export default async function AnalyticsPage() {
  const [supabase, user] = await Promise.all([createClient(), getUser()]);
  if (!user) return null;

  const [weeksRes, daysRes, exercisesRes] = await Promise.all([
    // Weeks for chart labels (most recent 16)
    supabase
      .from("training_weeks")
      .select("id, name, week_number, training_months(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(16),

    // Days with nested sets for volume + completion stats
    supabase
      .from("training_days")
      .select("id, week_id, is_completed, day_exercises(exercise_sets(weight, reps, is_completed))")
      .eq("user_id", user.id),

    // Distinct exercises the user has logged
    supabase
      .from("day_exercises")
      .select("exercise_id, exercises(id, name)")
      .eq("user_id", user.id),
  ]);

  const days = daysRes.data ?? [];
  const weeks = weeksRes.data ?? [];

  // ── Overall stats ────────────────────────────────────────────
  let totalVolume = 0;
  let totalSets = 0;
  let completedDays = 0;

  const volumeByWeekId = new Map<string, number>();

  for (const day of days) {
    if (day.is_completed) completedDays++;

    let dayVolume = 0;
    for (const de of (day.day_exercises ?? [])) {
      for (const s of (de.exercise_sets ?? [])) {
        if (!s.is_completed) continue;
        totalSets++;
        if (s.weight && s.reps) {
          const vol = s.weight * s.reps;
          totalVolume += vol;
          dayVolume += vol;
        }
      }
    }
    if (dayVolume > 0) {
      volumeByWeekId.set(day.week_id, (volumeByWeekId.get(day.week_id) ?? 0) + dayVolume);
    }
  }

  // ── Weekly volume chart data ─────────────────────────────────
  const weeklyData = weeks.map((w) => {
    const month = (w.training_months as { name: string } | null);
    const monthShort = month?.name?.split(" ")[0]?.slice(0, 3) ?? "";
    return {
      label: `${monthShort} W${w.week_number}`,
      volume: Math.round(volumeByWeekId.get(w.id) ?? 0),
    };
  });

  // ── Unique exercises used ────────────────────────────────────
  const exerciseMap = new Map<string, { id: string; name: string }>();
  for (const de of (exercisesRes.data ?? [])) {
    if (de.exercise_id && de.exercises && !exerciseMap.has(de.exercise_id)) {
      const ex = de.exercises as { id: string; name: string };
      exerciseMap.set(de.exercise_id, { id: ex.id, name: ex.name });
    }
  }
  const exercises = [...exerciseMap.values()].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AnalyticsClient
      totalVolume={totalVolume}
      totalSets={totalSets}
      completedDays={completedDays}
      weeklyData={weeklyData}
      exercises={exercises}
      userId={user.id}
    />
  );
}
