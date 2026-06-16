import { apiFetch } from "./client";

export const videoApi = {
  // 1. Get all channels
  getChannels: () => apiFetch("/channels"),

  // 2. Get video list (supports pagination and filtering)
  getItems: (mode: "available" | "upcoming" | "all" | "deleted", channelId: string, page: number, size: number) => {
    const params = new URLSearchParams();
    if (mode === "available") {
      params.append("notDownloaded", "true");
    } else if (mode === "upcoming") {
      params.append("liveBroadcastContent", "not_none");
      params.append("scheduledTimeIsInThePast", "false");
    } else if (mode === "deleted") {
      params.append("filterDeleted", "true");
    }

    if (channelId !== "all") {
      params.append("channelIds", channelId);
    }
    // Spring Data uses a 0-based index
    params.append("page", (page - 1).toString());
    params.append("size", size.toString());

    const queryString = params.toString();
    return apiFetch(`/items${queryString ? `?${queryString}` : ""}`);
  },

  // 3. Mark channel videos as processed (manually downloaded)
  markAllDone: (channelId: string) => {
    const body = channelId !== "all" ? { channelIds: [channelId] } : {};
    return apiFetch("/tasks/mark-all-manually-downloaded", { method: "PATCH", body: JSON.stringify(body) });
  },

  // 4. Trigger background task to fetch latest videos
  fetchTasks: (payload: Record<string, any>, signal?: AbortSignal) => apiFetch("/tasks/fetch", { method: "POST", body: JSON.stringify(payload), signal }),

  // 5. Trigger download task
  downloadVideos: (videoIds: string[]) => apiFetch("/tasks/download", { method: "POST", body: JSON.stringify({ videoIds }) }),

  // 6. Update single video processing status
  updateItemStatus: (videoId: string, status: string) => apiFetch(`/items/${videoId}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // 7. Get lightweight item statuses for background polling
  getItemStatuses: (videoIds: string[]) => {
    const params = new URLSearchParams();
    videoIds.forEach((id) => params.append("videoIds", id));
    return apiFetch(`/items/statuses?${params.toString()}`);
  },
};