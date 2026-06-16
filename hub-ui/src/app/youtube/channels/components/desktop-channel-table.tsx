import { RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Channel } from "../hooks/use-channels";
import { DesktopChannelSkeleton } from "./channel-skeletons";
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

interface DesktopChannelTableProps {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  deletingChannels: Set<string>;
  onDelete: (channelId: string, channelTitle: string) => void;
}

export function DesktopChannelTable({
  channels,
  loading,
  error,
  deletingChannels,
  onDelete,
}: DesktopChannelTableProps) {
  return (
    <div className="hidden md:block rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Handle</TableHead>
            <TableHead>Channel ID</TableHead>
            <TableHead className="text-center w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <DesktopChannelSkeleton />
          ) : error ? (
            <TableRow><TableCell colSpan={4} className="text-center h-24 text-destructive">Error: {error}</TableCell></TableRow>
          ) : channels.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No channels found.</TableCell></TableRow>
          ) : (
            channels.map((channel) => (
              <TableRow key={channel.channelId} className={`group transition-colors ${deletingChannels.has(channel.channelId) ? "opacity-50 pointer-events-none grayscale" : "hover:bg-muted/50"}`}>
                <TableCell className="font-medium text-base">{channel.title}</TableCell>
                <TableCell><a href={`https://www.youtube.com/${channel.handle}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">{channel.handle} <ExternalLink className="h-3 w-3" /></a></TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground"><a href={`https://www.youtube.com/channel/${channel.channelId}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">{channel.channelId}</a></TableCell>
                <TableCell className="text-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={deletingChannels.has(channel.channelId)}>
                        {deletingChannels.has(channel.channelId) ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
