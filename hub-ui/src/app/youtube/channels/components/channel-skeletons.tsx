import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function DesktopChannelSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function MobileChannelSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 gap-3">
          <div className="flex flex-col gap-2 overflow-hidden w-full">
            <Skeleton className="h-5 w-3/4 max-w-[200px]" />
            <Skeleton className="h-4 w-1/2 max-w-[120px]" />
            <Skeleton className="h-3 w-2/3 max-w-[180px]" />
          </div>
          <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
        </div>
      ))}
    </>
  );
}
