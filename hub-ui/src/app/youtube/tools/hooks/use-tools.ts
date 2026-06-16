import { useState, useEffect } from "react";
import { toast } from "sonner";
import { toolApi } from "@/lib/api";

export function useTools() {
  const [urlsToVerify, setUrlsToVerify] = useState("");
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResettingThumbnails, setIsResettingThumbnails] = useState(false);
  const [isStartingSync, setIsStartingSync] = useState(false);
  const [isIgnoringThumbnails, setIsIgnoringThumbnails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [notFoundVideoIds, setNotFoundVideoIds] = useState<string[]>([]);
  
  const [isStartingScheduler, setIsStartingScheduler] = useState(false);
  const [isStoppingScheduler, setIsStoppingScheduler] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState({ isRunning: false });

  const [verificationResult, setVerificationResult] = useState<{
    newUrls: string | null;
    undownloaded: string | null;
    error: string | null;
  } | null>(null);
  const [thumbnailStatus, setThumbnailStatus] = useState({
    isRunning: false,
    pendingCount: 0,
    failedCount: 0,
    totalCount: 0,
  });

  const fetchThumbnailStatus = async () => {
    try {
      const response = await toolApi.getThumbnailStatus();
      if (response?.data) {
        setThumbnailStatus(response.data);
      }
    } catch (err) {
      console.error("[Tools Tracking] Error fetching thumbnail status:", err);
    }
  };

  const fetchSchedulerStatus = async () => {
    try {
      const response = await toolApi.getSchedulerStatus();
      if (response) {
        setSchedulerStatus(response.data ?? response);
      }
    } catch (err) {
      console.error("[Tools Tracking] Error fetching scheduler status:", err);
    }
  };

  useEffect(() => {
    fetchThumbnailStatus();
    fetchSchedulerStatus();

    const handleFocus = async () => {
      try {
        if (!document.hasFocus()) return;
        const text = await navigator.clipboard.readText();
        const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/|.+\?v=)?([^"&?\/\s]{11})/;

        if (youtubeUrlRegex.test(text)) {
          let processedUrl = text.trim();
          try {
            const urlObj = new URL(processedUrl);
            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
              if (urlObj.searchParams.has('list')) {urlObj.searchParams.delete('list');}
              if (urlObj.searchParams.has('start_radio')) {urlObj.searchParams.delete('start_radio');}
              processedUrl = urlObj.toString();
            }
          } catch (e) {
            console.warn(`[Tools Tracking] Could not parse URL "${processedUrl}" for list parameter removal, using original URL:`, e);
          }

          if (!urlsToVerify.includes(processedUrl)) {
            setUrlsToVerify((prevUrls) => prevUrls ? `${prevUrls}\n` : processedUrl);
            toast.info("Auto-pasted YouTube URL from clipboard");
            console.info(`[Tools Tracking] Auto-pasted YouTube URL from clipboard: ${processedUrl}`);
          }
        }
      } catch (err) {
        console.warn("[Tools Tracking] Could not read from clipboard (this is normal if permission is not granted):", err);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [urlsToVerify]);

  const handleMarkAllDone = async () => {
    setIsMarkingDone(true);
    console.info("[Tools Tracking] Action: Attempting to mark all videos as done...");
    const toastId = toast.loading("Marking all videos as done...");
    const startTime = performance.now();
    try {
      const result = await toolApi.markAllAsProcessed();
      toast.success(`Successfully marked ${result?.data?.updatedItems || 0} videos as done.`, { id: toastId });
      console.info(`[Tools Tracking] Mark all done success in ${(performance.now() - startTime).toFixed(0)}ms. Updated items: ${result?.data?.updatedItems || 0}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to mark videos as done: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error marking all videos as done:", err);
    } finally {
      setIsMarkingDone(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    console.info("[Tools Tracking] Action: Attempting to delete all video data in database...");
    const toastId = toast.loading("Deleting all video data...");
    const startTime = performance.now();
    try {
      await toolApi.deleteAllVideoData();
      toast.success("Successfully deleted all video data.", { id: toastId });
      console.info(`[Tools Tracking] Delete all video data success in ${(performance.now() - startTime).toFixed(0)}ms.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to delete all video data: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error deleting all video data:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerifyUrls = async () => {
    setVerificationResult(null);
    const urls = urlsToVerify.split('\n').map(url => url.trim()).filter(url => url);
    if (urls.length === 0) {
      toast.warning("Please enter some URLs to verify.");
      return;
    }

    console.info(`[Tools Tracking] Action: Attempting to verify ${urls.length} URLs...`);
    const toastId = toast.loading("Verifying URLs...");
    const startTime = performance.now();
    setIsVerifying(true);
    try {
      const result = await toolApi.verifyUrls(urls);
      const newUrls = result.newUrls || [];
      const undownloadedUrls = result.undownloadedUrls || [];

      if (newUrls.length > 0 || undownloadedUrls.length > 0) {
        setVerificationResult({
          newUrls: newUrls.length > 0 ? newUrls.join('\n') : "All provided URLs are already in the system.",
          undownloaded: undownloadedUrls.length > 0 ? undownloadedUrls.join('\n') : "All provided URLs are downloaded.",
          error: null,
        });
      } else {
        setVerificationResult({
          newUrls: "All provided URLs are already in the system.",
          undownloaded: "All provided URLs are downloaded.",
          error: null,
        });
      }
      toast.success("URLs verified successfully.", { id: toastId });
      console.info(`[Tools Tracking] URLs verification success in ${(performance.now() - startTime).toFixed(0)}ms. New: ${newUrls.length}, Undownloaded: ${undownloadedUrls.length}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setVerificationResult({ newUrls: null, undownloaded: null, error: `Failed to verify URLs: ${errorMessage}` });
      toast.error(`Failed to verify URLs: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error verifying URLs:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetFailedThumbnails = async () => {
    setIsResettingThumbnails(true);
    console.info("[Tools Tracking] Action: Attempting to reset unavailable thumbnails...");
    const toastId = toast.loading("Resetting unavailable thumbnails...");
    const startTime = performance.now();
    try {
      const result = await toolApi.resetUnavailableThumbnails();
      toast.success(`Successfully reset ${result?.data?.resetItems || 0} thumbnails to PENDING.`, { id: toastId });
      console.info(`[Tools Tracking] Reset thumbnails success in ${(performance.now() - startTime).toFixed(0)}ms. Reset items: ${result?.data?.resetItems || 0}`);
      await fetchThumbnailStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to reset thumbnails: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error resetting thumbnails:", err);
    } finally {
      setIsResettingThumbnails(false);
    }
  };

  const handleStartThumbnailSync = async () => {
    setIsStartingSync(true);
    console.info("[Tools Tracking] Action: Attempting to start thumbnail sync job...");
    const toastId = toast.loading("Starting thumbnail sync job...");
    const startTime = performance.now();
    try {
      const result = await toolApi.syncThumbnails();
      // The API returns 202 Accepted or 200 OK with a message
      toast.success(result?.data || "Background thumbnail sync job started.", { id: toastId });
      console.info(`[Tools Tracking] Sync thumbnails started in ${(performance.now() - startTime).toFixed(0)}ms.`);
      await fetchThumbnailStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to start thumbnail sync: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error starting thumbnail sync:", err);
    } finally {
      setIsStartingSync(false);
    }
  };

  const handleIgnorePendingThumbnails = async () => {
    setIsIgnoringThumbnails(true);
    console.info("[Tools Tracking] Action: Attempting to ignore all pending thumbnails...");
    const toastId = toast.loading("Ignoring pending thumbnails...");
    const startTime = performance.now();
    try {
      const result = await toolApi.ignoreAllPendingThumbnails();
      toast.success(`Successfully ignored ${result?.data?.ignoredItems || 0} pending thumbnails.`, { id: toastId });
      console.info(`[Tools Tracking] Ignore pending thumbnails success in ${(performance.now() - startTime).toFixed(0)}ms. Ignored items: ${result?.data?.ignoredItems || 0}`);
      await fetchThumbnailStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to ignore pending thumbnails: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error ignoring pending thumbnails:", err);
    } finally {
      setIsIgnoringThumbnails(false);
    }
  };

  const handleStartScheduler = async () => {
    setIsStartingScheduler(true);
    console.info("[Tools Tracking] Action: Attempting to start fetch scheduler...");
    const toastId = toast.loading("Starting fetch scheduler...");
    try {
      await toolApi.startScheduler();
      toast.success("Auto-fetch scheduler started.", { id: toastId });
      await fetchSchedulerStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to start scheduler: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error starting scheduler:", err);
    } finally {
      setIsStartingScheduler(false);
    }
  };

  const handleStopScheduler = async () => {
    setIsStoppingScheduler(true);
    console.info("[Tools Tracking] Action: Attempting to stop fetch scheduler...");
    const toastId = toast.loading("Stopping fetch scheduler...");
    try {
      await toolApi.stopScheduler();
      toast.success("Auto-fetch scheduler stopped.", { id: toastId });
      await fetchSchedulerStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to stop scheduler: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error stopping scheduler:", err);
    } finally {
      setIsStoppingScheduler(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    console.info("[Tools Tracking] Action: Attempting to export CSV...");
    const toastId = toast.loading("Exporting CSV...");
    const startTime = performance.now();
    try {
      const blob = await toolApi.exportItemsToCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      a.download = `items_export_${yyyy}${mm}${dd}.csv`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("CSV exported successfully.", { id: toastId });
      console.info(`[Tools Tracking] CSV export success in ${(performance.now() - startTime).toFixed(0)}ms.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to export CSV: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error exporting CSV:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCsv = async (file: File) => {
    setIsImporting(true);
    console.info(`[Tools Tracking] Action: Attempting to import CSV file (${file.name})...`);
    const toastId = toast.loading("Importing CSV...");
    const startTime = performance.now();
    try {
      const result = await toolApi.importItemsFromCsv(file);
      // Using the exact payload structure from ItemController: Map.of("notFoundVideoIds", notFoundVideoIds)
      const returnedNotFoundIds = result?.data?.notFoundVideoIds || [];
      const notFoundCount = returnedNotFoundIds.length;
      const notFoundMessage = notFoundCount > 0 ? ` (${notFoundCount} items not found/skipped)` : "";
      
      const toastAction = notFoundCount > 0 ? {
        label: 'View Skipped',
        onClick: () => {
          setNotFoundVideoIds(returnedNotFoundIds);
          setShowNotFoundModal(true);
        }
      } : undefined;

      if (notFoundCount > 0) {
        toast.warning(`CSV import completed.${notFoundMessage}`, { 
          id: toastId, 
          duration: 10000,
          action: toastAction 
        });
      } else {
        toast.success("CSV imported successfully.", { 
          id: toastId, 
          duration: 4000
        });
      }
      console.info(`[Tools Tracking] CSV import success in ${(performance.now() - startTime).toFixed(0)}ms.`);

      await fetchThumbnailStatus();
      await fetchSchedulerStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to import CSV: ${errorMessage}`, { id: toastId });
      console.error("[Tools Tracking] Error importing CSV:", err);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    urlsToVerify, setUrlsToVerify,
    isMarkingDone, isDeleting, isVerifying,
    isResettingThumbnails, isStartingSync,
    isIgnoringThumbnails,
    isExporting, isImporting,
    showNotFoundModal, setShowNotFoundModal, notFoundVideoIds,
    isStartingScheduler, isStoppingScheduler, schedulerStatus,
    verificationResult, thumbnailStatus,
    handleMarkAllDone, handleDeleteAllData, handleVerifyUrls,
    handleResetFailedThumbnails, handleStartThumbnailSync, handleIgnorePendingThumbnails, fetchThumbnailStatus,
    handleStartScheduler, handleStopScheduler, fetchSchedulerStatus,
    handleExportCsv, handleImportCsv
  };
}