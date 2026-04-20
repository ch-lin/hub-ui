"use client";

import { useState } from "react";
import { toast } from "sonner";

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
    handleRefresh,
    handleMarkAllDone,
    handleFetch,
    handleDownload,
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
        onStatusChange={handleStatusChange}
        onDownload={handleDownload}
      />

      {/* 🚀 Mode 2: Desktop-specific view (Table) - hidden on md and smaller screens */}
      <DesktopVideoTable 
        items={items}
        loading={loading}
        copiedVideoId={copiedVideoId}
        updatingItems={updatingItems}
        downloadingItems={downloadingItems}
        processingStatuses={PROCESSING_STATUSES}
        onCopy={handleCopy}
        onStatusChange={handleStatusChange}
        onDownload={handleDownload}
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
    </div>
  );
}
