import { CalendarDays } from "lucide-react";
import { getMonths } from "@/lib/queries/months";
import MonthCard from "@/components/months/MonthCard";
import CreateMonthButton from "@/components/months/CreateMonthButton";
import EmptyState from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const months = await getMonths();

  // For each month, get week completion stats
  const monthsWithStats = await Promise.all(
    months.map(async (month) => {
      const { data: weeks } = await supabase
        .from("training_weeks")
        .select("is_completed")
        .eq("month_id", month.id);

      const weekCount = weeks?.length ?? 0;
      const completedWeeks = weeks?.filter((w) => w.is_completed).length ?? 0;
      return { month, weekCount, completedWeeks };
    })
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">
              Training
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight">
              My Months
            </h1>
          </div>
          <CreateMonthButton />
        </div>

        {/* Stats bar */}
        {months.length > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-slate-300">
                {months.length} month{months.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-300">
                {monthsWithStats.filter((m) => m.month.is_active).length} active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Months grid */}
      <div className="flex-1 px-4">
        {months.length === 0 ? (
          <EmptyState
            Icon={CalendarDays}
            title="No training months yet"
            description="Create your first training month to start tracking your workouts."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {monthsWithStats.map(({ month, weekCount, completedWeeks }) => (
              <MonthCard
                key={month.id}
                month={month}
                weekCount={weekCount}
                completedWeeks={completedWeeks}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
