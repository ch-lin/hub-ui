import { apiFetch } from "./client";

export const toolApi = {
  // 1. Mark all available videos as processed
  markAllAsProcessed: () => apiFetch("/tasks/mark-all-manually-downloaded", { method: "PATCH" }),
  
  // 2. Clear the entire database
  deleteAllVideoData: () => apiFetch("/tasks/deletion", { method: "DELETE" }),
  
  // 3. Verify URLs
  verifyUrls: (urls: string[]) => apiFetch("/tasks/verification", { method: "POST", body: JSON.stringify({ urls }) }),

  // 4. Get thumbnail synchronization status
  getThumbnailStatus: () => apiFetch("/tasks/sync-thumbnails", { method: "GET" }),
  
  // 5. Start thumbnail synchronization background job
  syncThumbnails: () => apiFetch("/tasks/sync-thumbnails", { method: "POST" }),
  
  // 6. Reset unavailable thumbnails to PENDING
  resetUnavailableThumbnails: (videoIds?: string[]) => apiFetch("/tasks/reset-unavailable-thumbnails", { method: "PATCH", body: JSON.stringify({ videoIds }) }),
};