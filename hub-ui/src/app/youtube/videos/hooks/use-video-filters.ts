import { useState, useEffect } from "react";

export function useVideoFilters() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [viewMode, setViewMode] = useState<"available" | "upcoming" | "all" | "deleted">(() => {
    if (typeof window === "undefined") return "available";
    return (localStorage.getItem("videos_viewMode") as "available" | "upcoming" | "all" | "deleted") || "available";
  });

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === "undefined") return 100;
    const saved = localStorage.getItem("videos_itemsPerPage");
    let val = saved ? Number(saved) : 100;
    const savedChannel = localStorage.getItem("videos_selectedChannel") || "all";
    if (savedChannel === "all" && val === Number.MAX_SAFE_INTEGER) {
      val = 100;
    }
    return val;
  });

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedChannel, setSelectedChannel] = useState<string>(() => {
    if (typeof window === "undefined") return "all";
    return localStorage.getItem("videos_selectedChannel") || "all";
  });

  const [forcePublishedAfter, setForcePublishedAfter] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("videos_forcePublishedAfter") === "true";
  });

  const [publishedAfterDate, setPublishedAfterDate] = useState<Date | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("videos_publishedAfterDate");
    if (!saved) return null;
    if (saved.includes("T")) return new Date(saved);
    const [y, m, d] = saved.split("-").map(Number);
    return new Date(y, m - 1, d);
  });

  // Effects to save filter values to localStorage
  useEffect(() => {
    localStorage.setItem("videos_selectedChannel", selectedChannel);
  }, [selectedChannel]);

  useEffect(() => {
    localStorage.setItem("videos_viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("videos_itemsPerPage", String(itemsPerPage));
  }, [itemsPerPage]);

  useEffect(() => {
    localStorage.setItem("videos_forcePublishedAfter", String(forcePublishedAfter));
  }, [forcePublishedAfter]);

  useEffect(() => {
    if (publishedAfterDate) {
      const year = publishedAfterDate.getFullYear();
      const month = String(publishedAfterDate.getMonth() + 1).padStart(2, "0");
      const day = String(publishedAfterDate.getDate()).padStart(2, "0");
      localStorage.setItem("videos_publishedAfterDate", `${year}-${month}-${day}`);
    } else {
      localStorage.removeItem("videos_publishedAfterDate");
    }
  }, [publishedAfterDate]);

  return {
    isMounted,
    viewMode, setViewMode,
    itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage,
    selectedChannel, setSelectedChannel,
    forcePublishedAfter, setForcePublishedAfter,
    publishedAfterDate, setPublishedAfterDate
  };
}
