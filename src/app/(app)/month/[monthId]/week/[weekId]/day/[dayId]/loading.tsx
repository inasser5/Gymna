import { Skeleton } from "@/components/ui/Skeleton";

export default function DayLoading() {
  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="flex gap-3 mt-3">
          <Skeleton className="h-7 w-28 rounded-xl" />
          <Skeleton className="h-7 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-1 w-full rounded-full mt-3" />
      </div>
      <div className="px-4 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl overflow-hidden">
            <div className="p-4 pb-2 flex justify-between">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-7 h-7 rounded-lg" />
            </div>
            <div className="flex flex-col gap-1 px-3 py-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full rounded-xl" />
              ))}
            </div>
            <div className="px-3 pb-3">
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
