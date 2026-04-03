import { Skeleton } from "@/components/ui/Skeleton";

export default function WeekLoading() {
  return (
    <div className="flex flex-col">
      <div className="px-4 pt-6 pb-5">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-7 w-36 mb-4" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="px-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-12" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="w-4 h-4 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-xl" />
              <Skeleton className="h-7 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
