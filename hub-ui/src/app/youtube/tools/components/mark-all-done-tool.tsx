import { CheckSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MarkAllDoneToolProps {
  isMarkingDone: boolean;
  onMarkAllDone: () => void;
}

export function MarkAllDoneTool({ isMarkingDone, onMarkAllDone }: MarkAllDoneToolProps) {
  return (
    <div className="bg-card text-card-foreground p-6 md:p-8 rounded-xl shadow-sm border border-border transition-all hover:shadow-md">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <CheckSquare className="h-6 w-6 text-yellow-500" />
        Mark All Videos as Done
      </h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        This will mark all currently <span className="font-medium px-1.5 py-0.5 bg-muted text-foreground rounded border border-border">Available</span> videos as processed. This is useful for clearing out a large backlog of videos you don&apos;t intend to download.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={isMarkingDone} className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500">
            {isMarkingDone ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
            {isMarkingDone ? "Marking..." : "Mark All as Processed"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all currently available videos as processed. This is useful for clearing out a large backlog of videos you don&apos;t intend to download.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onMarkAllDone}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
