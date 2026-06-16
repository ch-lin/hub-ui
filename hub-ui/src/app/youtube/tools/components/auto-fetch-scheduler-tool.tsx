import { Activity, Play, Square, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AutoFetchSchedulerToolProps {
  status: { isRunning: boolean };
  isStarting: boolean;
  isStopping: boolean;
  onStart: () => void;
  onStop: () => void;
  onRefreshStatus: () => void;
}

export function AutoFetchSchedulerTool({
  status,
  isStarting,
  isStopping,
  onStart,
  onStop,
  onRefreshStatus,
}: AutoFetchSchedulerToolProps) {
  return (
    <div className="bg-card text-card-foreground p-6 md:p-8 rounded-xl shadow-sm border border-border transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-500" />
            Auto-Fetch Scheduler
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage the background scheduler that periodically fetches YouTube data based on your configuration.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefreshStatus} className="w-fit shrink-0">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-lg border border-border bg-muted/30">
        <span className="text-sm font-medium text-muted-foreground">Current Status:</span>
        {status.isRunning ? (
          <span className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Running
          </span>
        ) : (
          <span className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-muted-foreground/50"></span>
            Stopped
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onStart}
          disabled={isStarting || status.isRunning}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
        >
          {isStarting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Start Scheduler
        </Button>
        <Button
          variant="outline"
          onClick={onStop}
          disabled={isStopping || !status.isRunning}
          className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
        >
          {isStopping ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Square className="h-4 w-4 mr-2 fill-current" />}
          Stop Scheduler
        </Button>
      </div>
    </div>
  );
}