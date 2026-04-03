import { createClient } from "@/lib/supabase/server";
import { Dumbbell, Search } from "lucide-react";
import type { Exercise } from "@/types/database";

const MUSCLE_ORDER = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Legs", "Glutes", "Core", "Cardio", "Full Body", "Other",
];

export default async function ExercisesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("exercises")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user?.id}`)
    .order("name");

  const exercises = (data ?? []) as Exercise[];

  // Group by muscle_group
  const grouped = new Map<string, Exercise[]>();
  for (const ex of exercises) {
    const group = ex.muscle_group || "Other";
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push(ex);
  }
  const sorted = [...grouped.entries()].sort(([a], [b]) => {
    const ai = MUSCLE_ORDER.indexOf(a);
    const bi = MUSCLE_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 pt-6 pb-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">Library</p>
        <h1 className="text-2xl font-bold text-white mb-4">Exercises</h1>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-sm text-slate-600">Search coming soon…</span>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-6">
        {sorted.map(([group, exs]) => (
          <div key={group}>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
              {group} · {exs.length}
            </p>
            <div className="flex flex-col gap-1.5">
              {exs.map((ex) => (
                <div key={ex.id} className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{ex.name}</p>
                    {ex.equipment && (
                      <p className="text-[11px] text-slate-600 mt-0.5">{ex.equipment}</p>
                    )}
                  </div>
                  <Dumbbell className="w-4 h-4 text-slate-700 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
