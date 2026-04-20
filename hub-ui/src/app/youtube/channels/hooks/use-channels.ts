import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { channelApi } from "@/lib/api";

export interface Channel {
  channelId: string;
  title: string;
  handle: string;
}

export interface AddChannelsResponse {
  addedChannels: Channel[];
  failedUrls: FailedUrl[];
}

export interface FailedUrl {
  url: string;
  reason: string;
}

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingChannels, setDeletingChannels] = useState<Set<string>>(new Set());
  const [newChannelUrl, setNewChannelUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchChannels = useCallback(async (options: { isManualRefresh?: boolean; showLoading?: boolean } = {}) => {
    const isManualRefresh = options.isManualRefresh ?? false;
    const showLoading = options.showLoading ?? true;
    
    console.info(`[Channels Tracking] Fetching channels... (Manual refresh: ${isManualRefresh})`);
    const startTime = performance.now();

    if (isManualRefresh) {
      toast.loading("Refreshing channels...", { id: "fetch-toast" });
    }
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const data: Channel[] = await channelApi.getChannels();
      const sortedData = data.sort((a, b) => a.title.localeCompare(b.title));
      setChannels(sortedData);
      console.info(`[Channels Tracking] Successfully fetched ${data.length} channels in ${(performance.now() - startTime).toFixed(0)}ms.`);

      if (isManualRefresh) {
        toast.success("Channels list updated!", { id: "fetch-toast" });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while fetching data.";
      setError(errorMessage);
      console.error("[Channels Tracking] Failed to fetch channels:", e);
      const toastId = isManualRefresh ? "fetch-toast" : "fetch-error-toast";
      toast.error(`Failed to load channels: ${errorMessage}`, { id: toastId });
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleRefresh = () => {
    fetchChannels({ isManualRefresh: true });
  };

  const handleAddChannel = async () => {
    const trimmedUrl = newChannelUrl.trim();
    if (!trimmedUrl) {
      toast.warning("Please enter a channel URL or @handle.");
      return;
    }

    setIsAdding(true);
    console.info(`[Channels Tracking] Action: Attempting to add channel from URL: ${trimmedUrl}`);
    const toastId = toast.loading(`Adding channel...`);
    const startTime = performance.now();

    try {
      const result: AddChannelsResponse = await channelApi.addChannels([newChannelUrl]);
      console.info(`[Channels Tracking] Add channel API response received in ${(performance.now() - startTime).toFixed(0)}ms:`, result);

      const wasAdded = result.addedChannels && result.addedChannels.length > 0;
      const didFail = result.failedUrls && result.failedUrls.length > 0;

      if (wasAdded) {
        const addedChannel = result.addedChannels[0];
        toast.success(`Added: ${addedChannel.title}`, { id: toastId });
        setNewChannelUrl("");
        await fetchChannels({ showLoading: false });
      } else if (didFail) {
        const failure = result.failedUrls[0];
        toast.error(`Failed to add: ${failure.reason}`, { id: toastId, duration: 5000 });
      } else {
        toast.info("Channel not added. It might already exist.", { id: toastId });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[Channels Tracking] Failed to add channel:", err);
      toast.error(`Failed to add channel: ${errorMessage}`, { id: toastId });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (channelId: string, channelTitle: string) => {
    setDeletingChannels((prev) => new Set(prev).add(channelId));
    console.info(`[Channels Tracking] Action: Attempting to delete channel: ${channelId} (${channelTitle})`);
    const toastId = toast.loading(`Deleting "${channelTitle}"...`);
    const startTime = performance.now();

    try {
      await channelApi.deleteChannel(channelId);
      setChannels((prevChannels) => prevChannels.filter((c) => c.channelId !== channelId));
      toast.success(`Deleted "${channelTitle}"`, { id: toastId });
      console.info(`[Channels Tracking] Successfully deleted channel: ${channelId} in ${(performance.now() - startTime).toFixed(0)}ms`);
    } catch (err) {
      console.error(`[Channels Tracking] Failed to delete channel ${channelId}:`, err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to delete "${channelTitle}": ${errorMessage}`, { id: toastId });
    } finally {
      setDeletingChannels((prev) => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
    }
  };

  return {
    channels,
    loading,
    error,
    deletingChannels,
    newChannelUrl,
    setNewChannelUrl,
    isAdding,
    handleRefresh,
    handleAddChannel,
    handleDelete,
  };
}
