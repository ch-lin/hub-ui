import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-2">
      <Button variant="outline" onClick={onPrevPage} disabled={currentPage === 1}>
        Previous
      </Button>
      <span className="text-sm font-medium bg-card text-card-foreground px-3 py-1.5 rounded-md border border-border shadow-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button variant="outline" onClick={onNextPage} disabled={currentPage === totalPages}>
        Next
      </Button>
    </div>
  );
}
