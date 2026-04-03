"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, Dumbbell, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatVolume } from "@/lib/utils";

interface WeeklyPoint { label: string; volume: number }
interface ExerciseOption { id: string; name: string }
interface MaxWeightPoint { day_name: string; max_weight: number }

interface Props {
  totalVolume: number;
  totalSets: number;
  completedDays: number;
  weeklyData: WeeklyPoint[];
  exercises: ExerciseOption[];
  userId: string;
}

const TOOLTIP_STYLE = {
  background: "rgba(10,15,30,0.97)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#e2e8f0",
};

export default function AnalyticsClient({
  totalVolume, totalSets, completedDays, weeklyData, exercises, userId,
}: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [progressData, setProgressData] = useState<MaxWeightPoint[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    setProgressData([]);
    if (!id) return;
    setLoadingProgress(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("get_exercise_max_weight_history", {
      p_user_id: userId,
      p_exercise_id: id,
      p_limit: 20,
    });
    setProgressData(
      ([...(data ?? [])]).reverse().map((d: { day_name: string; max_weight: number }) => ({
        day_name: d.day_name || "Day",
        max_weight: Number(d.max_weight),
      }))
    );
    setLoadingProgress(false);
  };

  const hasVolume = weeklyData.some((w) => w.volume > 0);

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">Overview</p>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
      </div>

      {/* Stats row */}
      <div className="px-4 grid grid-cols-3 gap-2 mb-6">
        {[
          { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, value: completedDays, label: "Days done" },
          { icon: <TrendingUp className="w-4 h-4 text-indigo-400" />, value: formatVolume(totalVolume), label: "Total volume" },
          { icon: <Dumbbell className="w-4 h-4 text-violet-400" />, value: totalSets, label: "Sets logged" },
        ].map(({ icon, value, label }) => (
          <div key={label} className="glass rounded-2xl p-3 flex flex-col gap-1">
            {icon}
            <p className="text-lg font-bold text-white leading-tight mt-1">{value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Volume */}
      <div className="px-4 mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Weekly Volume</p>
        <div className="glass rounded-2xl p-4">
          {!hasVolume ? (
            <p className="text-sm text-slate-600 text-center py-8">Complete some sets to see volume data</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} barSize={14}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 9 }}
                  axisLine={false} tickLine={false} width={30}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number) => [`${v.toLocaleString()} kg`, "Volume"]}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="volume" fill="url(#volGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Exercise Progress */}
      <div className="px-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Exercise Progress</p>
        <div className="glass rounded-2xl p-4">
          {exercises.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Log exercises to track progress</p>
          ) : (
            <>
              <select
                value={selectedId}
                onChange={(e) => handleSelect(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/40 mb-4 appearance-none"
              >
                <option value="" className="bg-slate-900">Select an exercise…</option>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-slate-900">{ex.name}</option>
                ))}
              </select>

              {loadingProgress ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !selectedId ? (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-sm text-slate-600">Pick an exercise to see your progress</p>
                </div>
              ) : progressData.length === 0 ? (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-sm text-slate-600">No completed sets with weight logged yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="day_name"
                      tick={{ fill: "#475569", fontSize: 9 }}
                      axisLine={false} tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#475569", fontSize: 9 }}
                      axisLine={false} tickLine={false} width={36}
                      tickFormatter={(v) => `${v}kg`}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v: number) => [`${v} kg`, "Max weight"]}
                    />
                    <Line
                      type="monotone" dataKey="max_weight"
                      stroke="#6366f1" strokeWidth={2}
                      dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#818cf8", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
