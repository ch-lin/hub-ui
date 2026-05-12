import Image from "next/image";
import { useState, useEffect, memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Download, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { MobileVideoSkeleton } from "./video-skeletons";

interface MobileVideoListProps {
  items: Item[];
  loading: boolean;
  updatingItems: Set<string>;
  downloadingItems: Set<string>;
  processingStatuses: ProcessingStatus[];
  onStatusChange: (videoId: string, status: ProcessingStatus) => void;
  onDownload: (videoId: string, title: string) => void;
}

interface MobileVideoCardProps {
  item: Item;
  isUpdating: boolean;
  isDownloading: boolean;
  processingStatuses: ProcessingStatus[];
  onStatusChange: (videoId: string, status: ProcessingStatus) => void;
  onDownload: (videoId: string, title: string) => void;
}

const MobileVideoCard = memo(
  function MobileVideoCard({
    item,
    isUpdating,
    isDownloading,
    processingStatuses,
    onStatusChange,
    onDownload,
  }: MobileVideoCardProps) {

    // Mobile version prefers higher quality fallback
    const fallbackUrl = item.thumbnailUrl.replace("maxresdefault", "hqdefault");

    const getTargetUrl = () => {
      if (item.resolvedThumbnailUrl && item.thumbnailStatus === "DOWNLOADED") {
        const isAbsoluteUrl = /^https?:\/\//i.test(item.resolvedThumbnailUrl);
        if (!isAbsoluteUrl) {
          const cleanPath = item.resolvedThumbnailUrl.startsWith('/') ? item.resolvedThumbnailUrl : `/${item.resolvedThumbnailUrl}`;
          return `/api${cleanPath}`;
        }
        return item.resolvedThumbnailUrl;
      }
      return fallbackUrl;
    };

    const [imgSrc, setImgSrc] = useState<string>(getTargetUrl());

    // Synchronize imgSrc when the virtual scroll reuses the component or fetches new data
    useEffect(() => {
      const targetUrl = getTargetUrl();
      
      console.debug(`[Mobile] Video ${item.videoId} thumbnail evaluation:`, {
        isLocal: targetUrl !== fallbackUrl,
        status: item.thumbnailStatus,
        targetUrl
      });
      
      setImgSrc(targetUrl);
    }, [item.resolvedThumbnailUrl, item.thumbnailStatus, fallbackUrl]);

    // Fallback if local image fails to load (e.g., backend returns 404)
    const handleError = () => {
      if (imgSrc !== fallbackUrl) {
        console.warn(`[Mobile] Failed to load local thumbnail for video ${item.videoId}. Falling back to YouTube URL.`);
        setImgSrc(fallbackUrl);
      }
    };

    return (
      <Card className="overflow-hidden flex flex-col">
        <div className="relative w-full aspect-video bg-muted">
          <Image 
            src={imgSrc} 
            alt="Thumbnail" 
            fill 
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover" 
            onError={handleError}
            unoptimized
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded shadow-sm backdrop-blur-sm font-mono tracking-wider">
            {item.videoId}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="font-semibold text-base line-clamp-2 leading-relaxed mb-1">
              <a href={`https://www.youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                {item.title}
              </a>
            </h3>
            <a href={`https://www.youtube.com/channel/${item.channelId}`} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:underline">
              {item.channelTitle}
            </a>
          </div>
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-border">
            <div className="flex flex-col gap-2">
              <Select value={item.status} onValueChange={(val) => onStatusChange(item.videoId, val as ProcessingStatus)} disabled={isUpdating}>
                <SelectTrigger className="h-10 w-fit shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{processingStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground font-medium pl-1" title={new Date(item.videoPublishedAt).toLocaleString()}>
                {new Date(item.videoPublishedAt).toLocaleDateString()}
              </span>
            </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant={item.status === 'DOWNLOADED' ? 'secondary' : 'default'} className="h-12 w-12 rounded-full shadow-md transition-transform active:scale-95" disabled={isDownloading}>
                {isDownloading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-5 w-5" />}
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
          </div>
        </div>
      </Card>
    );
  },
  (prev, next) => prev.item === next.item && prev.isUpdating === next.isUpdating && prev.isDownloading === next.isDownloading
);

export function MobileVideoList({
  items,
  loading,
  updatingItems,
  downloadingItems,
  processingStatuses,
  onStatusChange,
  onDownload,
}: MobileVideoListProps) {
  // 1. Create a ref for the virtual scroll container
  const parentRef = useRef<HTMLDivElement>(null);

  // 2. Initialize the virtualizer core
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 340, // Estimate card height + padding
    overscan: 3,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom = virtualRows.length > 0 ? rowVirtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1]?.end || 0) : 0;

  return (
    <div ref={parentRef} className="md:hidden h-[calc(100vh-280px)] overflow-auto rounded-xl">
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          <MobileVideoSkeleton />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No videos found.</div>
      ) : (
        <div style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
          {virtualRows.map((virtualRow) => {
            const item = items[virtualRow.index];
            return (
              <div key={item.videoId} data-index={virtualRow.index} ref={rowVirtualizer.measureElement} className="pb-4">
                <MobileVideoCard
                  item={item}
                  isUpdating={updatingItems.has(item.videoId)}
                  isDownloading={downloadingItems.has(item.videoId)}
                  processingStatuses={processingStatuses}
                  onStatusChange={onStatusChange}
                  onDownload={onDownload}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
