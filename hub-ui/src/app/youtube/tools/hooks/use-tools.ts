import { useState, useEffect } from "react";
import { toast } from "sonner";
import { toolApi } from "@/lib/api";

export function useTools() {
  const [urlsToVerify, setUrlsToVerify] = useState("");
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    newUrls: string | null;
    undownloaded: string | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
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

  return {
    urlsToVerify, setUrlsToVerify, isMarkingDone, isDeleting, isVerifying, verificationResult,
    handleMarkAllDone, handleDeleteAllData, handleVerifyUrls
  };
}