import Image from "next/image";
import { useState, memo, useRef, forwardRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, Copy, Download, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Item, ProcessingStatus } from "../page";
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
import { DesktopVideoSkeleton } from "./video-skeletons";

interface DesktopVideoTableProps {
  items: Item[];
  loading: boolean;
  copiedVideoId: string | null;
  updatingItems: Set<string>;
  downloadingItems: Set<string>;
  processingStatuses: ProcessingStatus[];
  onCopy: (videoId: string) => void;
  onStatusChange: (videoId: string, status: ProcessingStatus) => void;
  onDownload: (videoId: string, title: string) => void;
}

interface DesktopVideoRowProps {
  item: Item;
  isCopied: boolean;
  isUpdating: boolean;
  isDownloading: boolean;
  processingStatuses: ProcessingStatus[];
  onCopy: (videoId: string) => void;
  onStatusChange: (videoId: string, status: ProcessingStatus) => void;
  onDownload: (videoId: string, title: string) => void;
  setHoveredThumbnail: (val: { url: string; x: number; y: number } | null) => void;
  "data-index": number;
}

const DesktopVideoRow = memo(
  forwardRef<HTMLTableRowElement, DesktopVideoRowProps>(
    function DesktopVideoRow({
    item,
    isCopied,
    isUpdating,
    isDownloading,
    processingStatuses,
    onCopy,
    onStatusChange,
    onDownload,
    setHoveredThumbnail,
      "data-index": dataIndex,
    }, ref) {
    return (
      <TableRow ref={ref} data-index={dataIndex} className="group transition-colors hover:bg-muted/50">
        <TableCell className="font-medium text-sm">
          <a href={`https://www.youtube.com/channel/${item.channelId}`} target="_blank" rel="noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">{item.channelTitle}</a>
        </TableCell>
        <TableCell>
          <div className="w-[100px] h-[75px] cursor-pointer rounded overflow-hidden border border-border shadow-sm" 
               onMouseEnter={(e) => setHoveredThumbnail({ url: item.thumbnailUrl, x: e.clientX, y: e.clientY })} 
               onMouseMove={(e) => setHoveredThumbnail({ url: item.thumbnailUrl, x: e.clientX, y: e.clientY })} 
               onMouseLeave={() => setHoveredThumbnail(null)}>
            <Image src={item.thumbnailUrl} alt="Thumb" width={100} height={75} className="object-cover" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <span 
              className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/80 transition-colors"
              onClick={() => onCopy(item.videoId)}
              title="Copy Video ID"
            >
              {item.videoId}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onCopy(item.videoId)}>
              {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </TableCell>
        <TableCell className="max-w-[300px]">
          <a href={`https://www.youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline line-clamp-2 leading-relaxed">
            {item.title}
          </a>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground font-medium" title={new Date(item.videoPublishedAt).toLocaleString()}>
          {new Date(item.videoPublishedAt).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <Select
            value={item.status}
            onValueChange={(val) => onStatusChange(item.videoId, val as ProcessingStatus)}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-9 w-full text-xs 2xl:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {processingStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant={item.status === 'DOWNLOADED' ? 'secondary' : 'default'} className="shadow-sm" disabled={isDownloading}>
                {isDownloading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Download Video</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to download "{item.title}"?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDownload(item.videoId, item.title)}>
                  Download
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TableCell>
      </TableRow>
    );
    }
  ),
  (prev, next) => {
    // Only re-render when the item's object reference or its own state changes
    return (
      prev.item === next.item &&
      prev.isCopied === next.isCopied &&
      prev.isUpdating === next.isUpdating &&
      prev.isDownloading === next.isDownloading
    );
  }
);

export function DesktopVideoTable({
  items,
  loading,
  copiedVideoId,
  updatingItems,
  downloadingItems,
  processingStatuses,
  onCopy,
  onStatusChange,
  onDownload,
}: DesktopVideoTableProps) {
  // This state is only used by the desktop Table, so encapsulate it here!
  const [hoveredThumbnail, setHoveredThumbnail] = useState<{
    url: string;
    x: number;
    y: number;
  } | null>(null);

  // 1. Create a ref for the virtual scroll container
  const parentRef = useRef<HTMLDivElement>(null);

  // 2. Initialize the virtualizer core
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90, // Estimate the height of each row (thumbnail ~75px + padding)
    overscan: 5, // Overscan 5 items outside the viewport for smoother scrolling
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom = virtualRows.length > 0 ? rowVirtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1]?.end || 0) : 0;

  return (
    <> 
      {/* Enlarged thumbnail on mouse hover */}
      {hoveredThumbnail && (
        <div className="hidden md:block fixed z-50 pointer-events-none transition-transform duration-200" style={{ top: hoveredThumbnail.y + 15, left: hoveredThumbnail.x + 15 }}>
          <Image src={hoveredThumbnail.url.replace("maxresdefault", "hqdefault")} alt="Thumbnail" width={480} height={360} className="rounded-lg shadow-2xl border-2 border-white" />
        </div>
      )}

      {/* Desktop Table main body */}
      <div ref={parentRef} className="hidden md:block h-[calc(100vh-280px)] rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-auto relative">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-[150px]">Channel</TableHead>
              <TableHead className="w-[140px]">Thumbnail</TableHead>
              <TableHead className="w-[140px]">Video ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[160px]">Published</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="text-center w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <DesktopVideoSkeleton />
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No videos found.</TableCell></TableRow>
            ) : (
              <>
                {paddingTop > 0 && (
                  <tr key="padding-top"><td style={{ height: `${paddingTop}px` }} colSpan={7} className="p-0 border-0 m-0" /></tr>
                )}
                {virtualRows.map((virtualRow) => {
                  const item = items[virtualRow.index];
                  return (
                    <DesktopVideoRow
                      key={item.videoId}
                      item={item}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      isCopied={copiedVideoId === item.videoId}
                      isUpdating={updatingItems.has(item.videoId)}
                      isDownloading={downloadingItems.has(item.videoId)}
                      processingStatuses={processingStatuses}
                      onCopy={onCopy}
                      onStatusChange={onStatusChange}
                      onDownload={onDownload}
                      setHoveredThumbnail={setHoveredThumbnail}
                    />
                  );
                })}
                {paddingBottom > 0 && (
                  <tr key="padding-bottom"><td style={{ height: `${paddingBottom}px` }} colSpan={7} className="p-0 border-0 m-0" /></tr>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
