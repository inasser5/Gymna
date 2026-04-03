import { Skeleton } from "@/components/ui/Skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 pt-6 pb-5">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="px-4 grid grid-cols-3 gap-2 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-3 flex flex-col gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        ))}
      </div>
      <div className="px-4 mb-6">
        <Skeleton className="h-3 w-24 mb-3" />
        <div className="glass rounded-2xl p-4">
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>
      <div className="px-4">
        <Skeleton className="h-3 w-32 mb-3" />
        <div className="glass rounded-2xl p-4 flex flex-col gap-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
