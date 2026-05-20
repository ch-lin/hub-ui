import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { videoApi } from "@/lib/api";

export type ProcessingStatus = "NEW" | "PENDING" | "DOWNLOADING" | "DOWNLOADED" | "MANUALLY_DOWNLOADED" | "WATCHED" | "FAILED" | "DELETED" | "IGNORE";

export const PROCESSING_STATUSES: ProcessingStatus[] = [
  "NEW",
  "PENDING",
  "DOWNLOADING",
  "DOWNLOADED",
  "MANUALLY_DOWNLOADED",
  "WATCHED",
  "FAILED",
  "DELETED",
  "IGNORE",
];

export interface Item {
  videoId: string;
  title: string;
  kind: string;
  videoPublishedAt: string;
  scheduledStartTime: string;
  playlistId: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  localThumbnailPath?: string;
  resolvedThumbnailUrl?: string;
  thumbnailStatus?: string;
  status: ProcessingStatus;
}

export interface Channel {
  channelId: string;
  title: string;
}

export interface FetchFailure {
  channelTitle: string;
  reason?: string;
}

interface UseVideoDataProps {
  viewMode: "available" | "upcoming" | "all" | "deleted";
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  currentPage: number;
  itemsPerPage: number;
  forcePublishedAfter: boolean;
  publishedAfterDate: Date | null;
}

export function useVideoData({
  viewMode,
  selectedChannel,
  setSelectedChannel,
  currentPage,
  itemsPerPage,
  forcePublishedAfter,
  publishedAfterDate,
}: UseVideoDataProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [downloadingItems, setDownloadingItems] = useState<Set<string>>(new Set());
  const [isFetching, setIsFetching] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureDetailsData, setFailureDetailsData] = useState<FetchFailure[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      console.info("[Videos Tracking] Fetching channels filter list...");
      const startTime = performance.now();
      try {
        const data: Channel[] = await videoApi.getChannels();
        const sortedData = data.sort((a, b) => a.title.localeCompare(b.title));
        setChannels(sortedData);
        console.info(`[Videos Tracking] Successfully fetched ${data.length} channels in ${(performance.now() - startTime).toFixed(0)}ms.`);

        // After fetching channels, validate the stored selectedChannel
        if (typeof window !== "undefined") {
          const savedChannel = localStorage.getItem("videos_selectedChannel");
          if (savedChannel && savedChannel !== "all" && !data.some((c) => c.channelId === savedChannel)) {
            // The saved channel no longer exists, reset to default
            setSelectedChannel("all");
          }
        }
      } catch (e) {
        console.error("[Videos Tracking] Failed to fetch channels:", e);
        toast.error("Failed to fetch channels. The channel filter might be incomplete.");
      }
    };
    fetchChannels();
  }, [setSelectedChannel]);

  const fetchItems = useCallback(
    async (mode: "available" | "upcoming" | "all" | "deleted", channelId: string, page: number, size: number, options: { isManualRefresh?: boolean; showLoading?: boolean } = {}) => {
      const isManualRefresh = options.isManualRefresh ?? false;
      const showLoading = options.showLoading ?? true;
      
      console.info(`[Videos Tracking] Fetching videos... (mode: ${mode}, channel: ${channelId}, page: ${page}, manual: ${isManualRefresh})`);
      const startTime = performance.now();

      if (isManualRefresh) {
        toast.loading("Refreshing videos...", { id: "fetch-videos-toast" });
      }

      try {
        if (showLoading) setLoading(true);
        setError(null);
        const data = await videoApi.getItems(mode, channelId, page, size);
        setItems(data.content);
        if (data.page) {
          setTotalPages(data.page.totalPages);
          setTotalItems(data.page.totalElements);
        } else {
          setTotalPages(data.totalPages);
          setTotalItems(data.totalElements);
        }
        console.info(`[Videos Tracking] Successfully fetched ${data.content.length} video items in ${(performance.now() - startTime).toFixed(0)}ms.`);

        if (isManualRefresh) {
          toast.success("Videos list updated!", { id: "fetch-videos-toast" });
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while fetching data.";
        setError(errorMessage);
        const toastId = isManualRefresh ? "fetch-videos-toast" : "fetch-error-toast";
        toast.error(`Failed to load video items: ${errorMessage}`, { id: toastId });
        console.error("[Videos Tracking] Failed to fetch video items:", e);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchItems(viewMode, selectedChannel, currentPage, itemsPerPage);
  }, [fetchItems, viewMode, selectedChannel, currentPage, itemsPerPage]);

  const handleRefresh = () => {
    fetchItems(viewMode, selectedChannel, currentPage, itemsPerPage, { isManualRefresh: true, showLoading: false });
  };

  const handleMarkAllDone = async () => {
    setIsMarkingDone(true);
    console.info(`[Videos Tracking] Action: Marking all available videos as done for channel: ${selectedChannel}`);
    const toastId = toast.loading("Marking videos as done...");
    const startTime = performance.now();

    try {
      const result = await videoApi.markAllDone(selectedChannel);

      toast.success(`Successfully marked ${result.data.updatedItems} videos as done.`, { id: toastId });
      console.info(`[Videos Tracking] Mark all done success in ${(performance.now() - startTime).toFixed(0)}ms. Updated items: ${result.data.updatedItems}`);
      fetchItems(viewMode, selectedChannel, currentPage, itemsPerPage, { showLoading: false }); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to mark all done: ${message}`, { id: toastId });
      console.error(`[Videos Tracking] Error marking all done for channel ${selectedChannel}:`, err);
    } finally {
      setIsMarkingDone(false);
    }
  };

  const handleFetch = async () => {
    setIsFetching(true);
    console.info("[Videos Tracking] Action: Triggering fetch new videos from YouTube...");
    const startTime = performance.now();
    try {
      const requestBody: {
        delayInMilliseconds: number;
        channelIds?: string[];
        publishedAfter?: string;
        forcePublishedAfter?: boolean;
      } = {
        delayInMilliseconds: 50,
      };

      if (forcePublishedAfter && publishedAfterDate) {
        requestBody.publishedAfter = publishedAfterDate.toISOString();
        requestBody.forcePublishedAfter = true;
      }

      if (selectedChannel !== "all") {
        requestBody.channelIds = [selectedChannel];
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

      const result = await videoApi.fetchTasks(requestBody, controller.signal);
      clearTimeout(timeoutId);

      const {
        newItems = 0,
        standardVideoCount = 0,
        upcomingVideoCount = 0,
        liveVideoCount = 0,
        updatedItemsCount = 0,
        processedChannels = 0,
        failures = [] as FetchFailure[],
      } = result.data || {};

      if (failures.length > 0) {
        const failureCount = failures.length;
        const failedChannelNames = failures.map((f: FetchFailure) => f.channelTitle).filter(Boolean);
        let failureDetails = '';

        if (failedChannelNames.length > 0) {
          if (failedChannelNames.length <= 3) {
            failureDetails = `Failed to process: ${failedChannelNames.join(", ")}.`;
          } else {
            failureDetails = `Failed to process: ${failedChannelNames.slice(0, 2).join(", ")} and ${failedChannelNames.length - 2} more.`;
          }
        }

        const toastAction = failedChannelNames.length > 3 ? {
          label: 'Show Details',
          onClick: () => {
            setFailureDetailsData(failures);
            setShowFailureModal(true);
          }
        } : undefined;

        if (processedChannels > 0) {
          // Partial failure
          const successMessage = `Fetch partially complete. Processed ${processedChannels} channel(s).`;
          toast.warning(`${successMessage} ${failureDetails}`, { 
            duration: 10000,
            action: toastAction
          });
        } else {
          // Total failure
          toast.error(`Fetch failed. ${failureDetails || `Processed 0 channels with ${failureCount} failure(s).`}`, { 
            duration: 10000,
            action: toastAction
          });
        }
        console.warn("[Videos Tracking] Fetch failures:", failures);
      } else {
        let message;
        if (newItems > 0 || updatedItemsCount > 0) {
          const parts: string[] = [];
          const details: string[] = [];
          if (newItems > 0) {
            if (standardVideoCount > 0) details.push(`${standardVideoCount} video${standardVideoCount > 1 ? "s" : ""}`);
            if (upcomingVideoCount > 0) details.push(`${upcomingVideoCount} upcoming`);
            if (liveVideoCount > 0) details.push(`${liveVideoCount} live`);

            parts.push(`Found ${newItems} new item${newItems > 1 ? "s" : ""}${details.length > 0 ? ` (${details.join(", ")})` : ""}`);
          }
          if (updatedItemsCount > 0) {
            parts.push(`Updated ${updatedItemsCount} existing item${updatedItemsCount > 1 ? "s" : ""}`);
          }
          message = `Fetch complete. ${parts.join(" and ")} across ${processedChannels} channel${processedChannels > 1 ? "s" : ""}.`;
        } else {
          message = `Fetch complete. No new items or updates found across ${processedChannels} channel${processedChannels > 1 ? "s" : ""}.`;
        }
        toast.success(message);
        console.info(`[Videos Tracking] Fetch success in ${(performance.now() - startTime).toFixed(0)}ms. ${message}`);
      }
      fetchItems(viewMode, selectedChannel, currentPage, itemsPerPage, { showLoading: false }); // Refresh the list on success
    } catch (err) {
      let message = "An unknown error occurred.";
      if (err instanceof Error) {
        message = err.name === "AbortError" ? "The fetch operation timed out after 5 minutes." : err.message;
      }
      toast.error(message);
      console.error("[Videos Tracking] Error during fetch new videos:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDownload = useCallback(async (videoId: string, title: string) => {
    setDownloadingItems((prev) => new Set(prev).add(videoId));
    console.info(`[Videos Tracking] Action: Submitting download job for video: ${videoId}`);
    const toastId = toast.loading(`Submitting download job for "${title}"...`);
    const startTime = performance.now();

    try {
      const result = await videoApi.downloadVideos([videoId]);

      const createdTasksCount = result.data?.createdTasks;
      if (typeof createdTasksCount === "number" && createdTasksCount > 0) {
        const message = `Successfully created ${createdTasksCount} download task(s).`;
        toast.success(message, { id: toastId });
        console.info(`[Videos Tracking] Download job submitted successfully in ${(performance.now() - startTime).toFixed(0)}ms.`);
      } else {
        throw new Error("Failed to create download tasks. The server did not confirm task creation.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred while submitting the download job.";
      toast.error(`Download failed for "${title}": ${message}`, { id: toastId });
      console.error(`[Videos Tracking] Error submitting download for videoId ${videoId}:`, err);
    } finally {
      setDownloadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  }, []);

  const handleStatusChange = async (videoId: string, newStatus: ProcessingStatus) => {
    // If the item is already being updated, ignore this operation to prevent duplicate triggers.
    if (updatingItems.has(videoId)) {
      return;
    }

    console.info(`[Videos Tracking] Action: Updating status for video ${videoId} to ${newStatus}`);
    const startTime = performance.now();

    const originalItems = items;
    // Optimistically update the UI immediately so the Select shows the new value without flickering
    setItems((prevItems) =>
      prevItems.map((item) => (item.videoId === videoId ? { ...item, status: newStatus } : item))
    );

    setUpdatingItems((prev) => new Set(prev).add(videoId));

    try {
      await videoApi.updateItemStatus(videoId, newStatus);
      toast.success(`Status for video updated to ${newStatus}.`, { duration: 2000 });
      console.info(`[Videos Tracking] Status updated successfully in ${(performance.now() - startTime).toFixed(0)}ms.`);
    } catch (err) {
      // Revert the change if the API call fails
      setItems(originalItems);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to update status: ${errorMessage}`);
      console.error(`[Videos Tracking] Failed to update status for video ${videoId} to ${newStatus}:`, err);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  };

  return {
    items,
    totalItems,
    totalPages,
    loading,
    error,
    channels,
    updatingItems,
    downloadingItems,
    isFetching,
    isMarkingDone,
    showFailureModal,
    setShowFailureModal,
    failureDetailsData,
    handleRefresh,
    handleMarkAllDone,
    handleFetch,
    handleDownload,
    handleStatusChange,
  };
}
