import { cn } from "@/lib/utils";

interface StatBadgeProps {
  label: string;
  value: string | number;
  color?: "indigo" | "emerald" | "amber" | "rose" | "slate";
}

const colorMap = {
  indigo: "bg-indigo-500/15 text-indigo-400",
  emerald: "bg-emerald-500/15 text-emerald-400",
  amber:  "bg-amber-500/15 text-amber-400",
  rose:   "bg-rose-500/15 text-rose-400",
  slate:  "bg-white/5 text-slate-400",
};

export default function StatBadge({ label, value, color = "slate" }: StatBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium", colorMap[color])}>
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
