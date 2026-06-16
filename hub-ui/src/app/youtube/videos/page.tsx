"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Pagination } from "./components/pagination";
import { DesktopVideoTable } from "./components/desktop-video-table";
import { MobileVideoList } from "./components/mobile-video-list";
import { VideoFilterBar } from "./components/video-filter-bar";
import { useVideoFilters } from "./hooks/use-video-filters";
import { useVideoData, PROCESSING_STATUSES } from "./hooks/use-video-data";

export type { ProcessingStatus, Item } from "./hooks/use-video-data";

export default function Home() {
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);

  // 🌟 Custom hook to get all filter states and settings
  const {
    isMounted,
    viewMode, setViewMode,
    itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage,
    selectedChannel, setSelectedChannel,
    forcePublishedAfter, setForcePublishedAfter,
    publishedAfterDate, setPublishedAfterDate
  } = useVideoFilters();

  // 🌟 Custom hook to handle API and data logic
  const {
    items,
    totalItems,
    totalPages,
    loading,
    channels,
    updatingItems,
    downloadingItems,
    isFetching,
    isMarkingDone,
    selectedVideoIds,
    setSelectedVideoIds,
    showFailureModal,
    setShowFailureModal,
    failureDetailsData,
    handleRefresh,
    handleMarkAllDone,
    handleFetch,
    handleDownload,
    handleBatchDownload,
    handleStatusChange,
  } = useVideoData({
    viewMode,
    selectedChannel,
    setSelectedChannel,
    currentPage,
    itemsPerPage,
    forcePublishedAfter,
    publishedAfterDate,
  });

  const handleSelectionChange = (videoId: string, isSelected: boolean) => {
    setSelectedVideoIds(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(videoId);
      } else {
        newSet.delete(videoId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    const newSet = new Set(selectedVideoIds);
    items.forEach(item => {
      if (isSelected && !['PENDING', 'DOWNLOADING'].includes(item.status)) {
        newSet.add(item.videoId);
      } else if (!isSelected) {
        newSet.delete(item.videoId);
      }
    });
    setSelectedVideoIds(newSet);
  };

  const handleCopy = (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Video URL copied to clipboard!");
      console.info(`[Videos Tracking] Action: Copied URL for video ${videoId} to clipboard.`);
      setCopiedVideoId(videoId);
      setTimeout(() => {
        setCopiedVideoId(null);
      }, 2000); // Reset after 2 seconds
    }).catch(err => {
      const errorMessage = "Failed to copy URL to clipboard.";
      toast.error(errorMessage);
      console.error(`[Videos Tracking] ${errorMessage}`, err);
    });
  };

  const handleCopyFailures = () => {
    if (failureDetailsData.length === 0) return;

    const textToCopy = failureDetailsData
      .map(f => `${f.channelTitle}: ${f.reason || 'Unknown error'}`)
      .join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success("All failure reasons copied to clipboard!");
    }).catch(err => {
      toast.error("Failed to copy failure reasons.");
      console.error("Failed to copy failure reasons:", err);
    });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if (!isMounted) {
    return null;
  }
  
  return (
    <div className="font-sans flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8">
      
      {/* 🚀 Hybrid Header Panel */}
      <VideoFilterBar 
        channels={channels}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        forcePublishedAfter={forcePublishedAfter}
        onForcePublishedAfterChange={setForcePublishedAfter}
        publishedAfterDate={publishedAfterDate}
        onPublishedAfterDateChange={setPublishedAfterDate}
        totalItems={totalItems}
        isFetching={isFetching}
        onFetch={handleFetch}
        onRefresh={handleRefresh}
        isMarkingDone={isMarkingDone}
        onMarkAllDone={handleMarkAllDone}
      />

      {/* 🚀 Mode 1: Mobile-specific view (Card) - hidden on md and larger screens */}
      <MobileVideoList 
        items={items}
        loading={loading}
        updatingItems={updatingItems}
        downloadingItems={downloadingItems}
        processingStatuses={PROCESSING_STATUSES}
        selectedVideoIds={selectedVideoIds}
        onStatusChange={handleStatusChange}
        onDownload={handleDownload}
        onSelectionChange={handleSelectionChange}
      />

      {/* 🚀 Mode 2: Desktop-specific view (Table) - hidden on md and smaller screens */}
      <DesktopVideoTable 
        items={items}
        loading={loading}
        copiedVideoId={copiedVideoId}
        updatingItems={updatingItems}
        downloadingItems={downloadingItems}
        processingStatuses={PROCESSING_STATUSES}
        selectedVideoIds={selectedVideoIds}
        onCopy={handleCopy}
        onStatusChange={handleStatusChange}
        onDownload={handleDownload}
        onSelectionChange={handleSelectionChange}
        onSelectAll={handleSelectAll}
      />

      {/* Pagination control */}
      {!loading && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onNextPage={handleNextPage} 
          onPrevPage={handlePrevPage} 
        />
      )}

      {/* Floating Action Bar for Batch Download */}
      {selectedVideoIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-lg rounded-full pl-6 pr-2 py-2 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <span className="text-sm font-medium text-nowrap">
            {selectedVideoIds.size} selected
          </span>
          <Button 
            onClick={() => handleBatchDownload(Array.from(selectedVideoIds))}
            className="rounded-full shadow-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Selected
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSelectedVideoIds(new Set())}
            className="rounded-full h-8 w-8 ml-1 hover:bg-muted"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Fetch Failures Dialog */}
      <Dialog open={showFailureModal} onOpenChange={setShowFailureModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Fetch Failure Details</DialogTitle>
            <DialogDescription>
              The following channels could not be processed. See details below.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <ul className="space-y-3">
              {failureDetailsData.map((failure, index) => (
                <li key={index} className="rounded-md border p-3">
                  <p className="font-semibold text-primary">{failure.channelTitle}</p>
                  {failure.reason && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Reason: {failure.reason}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCopyFailures}>
              <Copy className="mr-2 h-4 w-4" />
              Copy All Reasons
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
