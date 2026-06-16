import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChannelActionBarProps {
  newChannelUrl: string;
  setNewChannelUrl: (url: string) => void;
  isAdding: boolean;
  onAddChannel: () => void;
  totalChannels: number;
  loading: boolean;
  onRefresh: () => void;
}

export function ChannelActionBar({
  newChannelUrl,
  setNewChannelUrl,
  isAdding,
  onAddChannel,
  totalChannels,
  loading,
  onRefresh,
}: ChannelActionBarProps) {
  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-4 bg-card text-card-foreground p-4 rounded-xl shadow-sm border border-border">
      {/* Left section: Add new channel */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (!isAdding && newChannelUrl.trim()) {
            onAddChannel();
          }
        }}
        className="flex items-center gap-2 flex-1 min-w-[280px]"
      >
        <Input
          type="text"
          placeholder="Channel URL or @handle"
          className="flex-1 min-w-[150px]"
          value={newChannelUrl}
          onChange={(e) => setNewChannelUrl(e.target.value)}
          disabled={isAdding}
        />
        <Button type="submit" disabled={isAdding || !newChannelUrl.trim()} className="shrink-0">
          {isAdding ? <RefreshCw className="h-4 w-4 animate-spin sm:mr-2" /> : <Plus className="h-4 w-4 sm:mr-2" />}
          <span className="hidden sm:inline">Add Channel</span>
        </Button>
      </form>

      {/* Right section: Action buttons */}
      <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
        {totalChannels > 0 && <span className="text-sm font-medium text-muted-foreground mr-2 hidden sm:block">Total: {totalChannels}</span>}
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading} title="Refresh channels">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
