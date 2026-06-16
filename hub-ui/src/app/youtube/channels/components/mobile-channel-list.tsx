import { RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Channel } from "../hooks/use-channels";
import { MobileChannelSkeleton } from "./channel-skeletons";
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

interface MobileChannelListProps {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  deletingChannels: Set<string>;
  onDelete: (channelId: string, channelTitle: string) => void;
}

export function MobileChannelList({
  channels,
  loading,
  error,
  deletingChannels,
  onDelete,
}: MobileChannelListProps) {
  return (
    <div className="md:hidden flex flex-col divide-y divide-border rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      {loading ? (
        <MobileChannelSkeleton />
      ) : error ? (
        <div className="text-center py-12 text-destructive font-medium">Error: {error}</div>
      ) : channels.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No channels found.</div>
      ) : (
        channels.map((channel) => (
          <div key={channel.channelId} className={`flex items-center justify-between p-4 gap-3 transition-colors ${deletingChannels.has(channel.channelId) ? "opacity-50 pointer-events-none grayscale" : "hover:bg-muted/50"}`}>
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium text-base truncate mb-1">{channel.title}</span>
              <a href={`https://www.youtube.com/${channel.handle}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate inline-flex items-center gap-1 w-fit">{channel.handle} <ExternalLink className="h-3 w-3" /></a>
              <span className="text-xs font-mono text-muted-foreground truncate mt-1">{channel.channelId}</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10" disabled={deletingChannels.has(channel.channelId)}>
                  {deletingChannels.has(channel.channelId) ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the channel "{channel.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(channel.channelId, channel.title)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))
      )}
    </div>
  );
}
