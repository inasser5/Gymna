import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="glass rounded-3xl p-8 text-center max-w-xs w-full">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-7 h-7 text-violet-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Analytics</h2>
        <p className="text-sm text-slate-500">
          Volume trends, max weight history, and progress charts — coming soon.
        </p>
      </div>
    </div>
  );
}
