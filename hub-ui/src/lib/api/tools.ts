import { apiFetch } from "./client";

export const toolApi = {
  // 1. Mark all available videos as processed
  markAllAsProcessed: () => apiFetch("/tasks/mark-all-manually-downloaded", { method: "PATCH" }),
  
  // 2. Clear the entire database
  deleteAllVideoData: () => apiFetch("/tasks/deletion", { method: "DELETE" }),
  
  // 3. Verify URLs
  verifyUrls: (urls: string[]) => apiFetch("/tasks/verification", { method: "POST", body: JSON.stringify({ urls }) }),
};