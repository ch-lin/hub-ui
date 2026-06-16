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

  // 7. Ignore all pending thumbnails
  ignoreAllPendingThumbnails: () => apiFetch("/tasks/ignore-all-pending-thumbnails", { method: "PATCH" }),

  // 8. Auto-Fetch Scheduler
  startScheduler: () => apiFetch("/fetch-scheduler/start", { method: "POST" }),
  stopScheduler: () => apiFetch("/fetch-scheduler/stop", { method: "POST" }),
  getSchedulerStatus: () => apiFetch("/fetch-scheduler/status", { method: "GET" }),

  // 9. CSV Export & Import (Bypassing apiFetch due to Blob/FormData requirements)
  exportItemsToCsv: async () => {
    const response = await fetch("/api/items/export?mediaType=csv", { method: "GET" });
    if (!response.ok) throw new Error(`Export failed! Status: ${response.status}`);
    return response.blob();
  },

  importItemsFromCsv: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/items/import", {
      method: "POST",
      body: formData, // Browser will automatically set the correct Content-Type with boundary
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const apiError = result.data;
      const errorMessage = apiError?.message || result.message || `Import failed! Status: ${response.status}`;
      throw new Error(errorMessage);
    }
    return result;
  },
};