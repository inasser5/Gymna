import { Skeleton } from "@/components/ui/Skeleton";

export default function MonthLoading() {
  return (
    <div className="flex flex-col">
      <div className="px-4 pt-6 pb-5">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="px-4 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-xl" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
