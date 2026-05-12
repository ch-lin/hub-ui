import { ImageIcon, Play, RefreshCw, RotateCcw } from "lucide-react";
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

interface SyncThumbnailsToolProps {
  status: {
    isRunning: boolean;
    pendingCount: number;
    failedCount: number;
    totalCount: number;
  };
  isStartingSync: boolean;
  isResetting: boolean;
  onStartSync: () => void;
  onResetFailed: () => void;
  onRefreshStatus: () => void;
}

export function SyncThumbnailsTool({
  status,
  isStartingSync,
  isResetting,
  onStartSync,
  onResetFailed,
  onRefreshStatus,
}: SyncThumbnailsToolProps) {
  return (
    <div className="bg-card text-card-foreground p-6 md:p-8 rounded-xl shadow-sm border border-border transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-indigo-500" />
            Thumbnail Synchronization
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage the background job that downloads missing video thumbnails.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefreshStatus} className="w-fit">
          <RefreshCw className={`h-4 w-4 mr-2 ${status.isRunning ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
          <div className="text-2xl font-bold">{status.totalCount}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total</div>
        </div>
        <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-lg p-4 text-center border border-blue-500/20">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{status.pendingCount}</div>
          <div className="text-xs text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider mt-1">Pending</div>
        </div>
        <div className="bg-destructive/10 rounded-lg p-4 text-center border border-destructive/20">
          <div className="text-2xl font-bold text-destructive">{status.failedCount}</div>
          <div className="text-xs text-destructive/80 uppercase tracking-wider mt-1">Failed</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onStartSync} 
          disabled={isStartingSync || status.isRunning || status.pendingCount === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
        >
          {isStartingSync ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {status.isRunning ? "Sync Job is Running..." : "Start Background Sync"}
        </Button>

        <Button 
          variant="outline" 
          onClick={onResetFailed}
          disabled={isResetting || status.failedCount === 0 || status.isRunning}
          className="flex-1"
        >
          {isResetting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
          Reset Failed to Pending
        </Button>
      </div>
    </div>
  );
}
