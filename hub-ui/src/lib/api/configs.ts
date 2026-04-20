import { apiFetch } from "./client";

export const configApi = {
  // === Downloader Configs ===
  getDownloaderConfigs: () => apiFetch("/configs"),
  getDownloaderConfig: (name: string) => apiFetch(`/configs/${name}`),
  createDownloaderConfig: (payload: Record<string, any>) => apiFetch("/configs", { method: "POST", body: JSON.stringify(payload) }),
  updateDownloaderConfig: (name: string, payload: Record<string, any>) => apiFetch(`/configs/${name}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteDownloaderConfig: (name: string) => apiFetch(`/configs/${name}`, { method: "DELETE" }),

  // === Hub Configs ===
  getHubConfigs: () => apiFetch("/hub/configs"),
  getHubTimeZones: () => apiFetch("/hub/configs/timezones"),
  getHubConfig: (name: string) => apiFetch(`/hub/configs/${name}`),
  createHubConfig: (payload: Record<string, any>) => apiFetch("/hub/configs", { method: "POST", body: JSON.stringify(payload) }),
  updateHubConfig: (name: string, payload: Record<string, any>) => apiFetch(`/hub/configs/${name}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteHubConfig: (name: string) => apiFetch(`/hub/configs/${name}`, { method: "DELETE" }),
};