import { apiFetch } from "./client";

export const channelApi = {
  getChannels: () => apiFetch("/channels"),
  addChannels: (urls: string[]) => apiFetch("/channels", { method: "POST", body: JSON.stringify({ urls }) }),
  deleteChannel: (channelId: string) => apiFetch(`/channels/${channelId}`, { method: "DELETE" }),
};