import { Trash2, AlertTriangle, RefreshCw } from "lucide-react";
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

interface CleanupDatabaseToolProps {
  isDeleting: boolean;
  onDeleteAllData: () => void;
}

export function CleanupDatabaseTool({ isDeleting, onDeleteAllData }: CleanupDatabaseToolProps) {
  return (
    <div className="bg-destructive/5 p-6 md:p-8 rounded-xl shadow-sm border border-destructive/20 transition-all hover:shadow-md">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-6 w-6" />
        Cleanup Database (Danger Zone)
      </h2>
      <p className="text-sm text-destructive/80 mb-6 leading-relaxed">
        <span className="font-bold underline">Warning:</span> This will permanently delete all video items from the database. This action cannot be undone. Make sure you really want to start fresh.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isDeleting}>
            {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {isDeleting ? "Deleting..." : "Delete All Video Data"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all video items from the database. This action cannot be undone. Make sure you really want to start fresh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
