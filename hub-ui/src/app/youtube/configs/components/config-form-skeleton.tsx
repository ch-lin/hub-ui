import { Skeleton } from "@/components/ui/skeleton";

export function ConfigFormSkeleton() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-pulse">
        {/* Row 1 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex items-end pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="md:col-span-2 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Row 3 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Divider */}
        <div className="col-span-1 md:col-span-2 border-t border-border my-2"></div>

        {/* Row 4 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
