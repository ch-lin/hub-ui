import { apiFetch } from "./client";

export const tagApi = {
  getTags: () => apiFetch("/tags", { cache: "no-cache" }),
  createTag: (name: string) => apiFetch("/tags", { method: "POST", body: JSON.stringify({ name }) }),
  deleteTag: (name: string) => apiFetch(`/tags/${name}`, { method: "DELETE" }),
};