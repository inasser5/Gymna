import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDayWithExercises } from "@/lib/queries/days";
import DayWorkoutClient from "@/components/exercises/DayWorkoutClient";
import type { Exercise } from "@/types/database";

interface PageProps {
  params: Promise<{
    monthId: string;
    weekId: string;
    dayId: string;
  }>;
}

export default async function DayPage({ params }: PageProps) {
  const { monthId, weekId, dayId } = await params;

  const [dayData, exercisesResult] = await Promise.all([
    getDayWithExercises(dayId),
    (async () => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .order("name");
      return (data ?? []) as Exercise[];
    })(),
  ]);

  if (!dayData) notFound();

  if (dayData.is_rest_day) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="glass rounded-3xl p-8 text-center max-w-xs w-full">
          <p className="text-4xl mb-3">😴</p>
          <h2 className="text-lg font-bold text-white mb-1">Rest Day</h2>
          <p className="text-sm text-slate-500">
            {dayData.name} is set as a rest day. Go back and toggle rest off to add exercises.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DayWorkoutClient
      day={dayData}
      initialExercises={dayData.day_exercises}
      allExercises={exercisesResult}
      weekId={weekId}
      monthId={monthId}
    />
  );
}
