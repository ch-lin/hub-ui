import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export function DesktopVideoSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
          <TableCell><Skeleton className="h-[75px] w-[100px] rounded" /></TableCell>
          <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
          <TableCell><Skeleton className="h-5 w-full max-w-[280px]" /><Skeleton className="h-4 w-3/4 max-w-[200px] mt-2" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-9 w-[130px]" /></TableCell>
          <TableCell className="text-center"><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function MobileVideoSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden flex flex-col">
          <Skeleton className="w-full aspect-video rounded-none" />
          <div className="p-4 flex flex-col flex-1 gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3 mt-1" />
            </div>
            <div className="flex items-end justify-between mt-auto pt-3 border-t border-border">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-[140px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
