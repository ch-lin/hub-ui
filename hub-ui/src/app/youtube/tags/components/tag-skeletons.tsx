import { Skeleton } from "@/components/ui/skeleton";

export function TagListSkeleton() {
  // Provide several different widths to simulate the varying lengths of real tags
  const widths = ["w-20", "w-24", "w-16", "w-28", "w-20", "w-32", "w-16", "w-24"];
  
  return (
    <div className="flex flex-wrap gap-3">
      {widths.map((w, i) => (
        <Skeleton key={i} className={`h-8 ${w} rounded-full`} />
      ))}
    </div>
  );
}
