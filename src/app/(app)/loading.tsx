import { GridSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-9 w-28 rounded-2xl" />
        </div>
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
      <GridSkeleton count={4} />
    </div>
  );
}
