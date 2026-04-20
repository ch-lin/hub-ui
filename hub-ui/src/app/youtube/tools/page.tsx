"use client";

import { useTools } from "./hooks/use-tools";
import { MarkAllDoneTool } from "./components/mark-all-done-tool";
import { VerifyUrlsTool } from "./components/verify-urls-tool";
import { CleanupDatabaseTool } from "./components/cleanup-database-tool";

export default function ToolsPage() {
  const {
    urlsToVerify,
    setUrlsToVerify,
    isMarkingDone,
    isDeleting,
    isVerifying,
    verificationResult,
    handleMarkAllDone,
    handleDeleteAllData,
    handleVerifyUrls,
  } = useTools();

  return (
    <div className="font-sans flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <main className="w-full max-w-4xl mx-auto space-y-6">
        <MarkAllDoneTool
          isMarkingDone={isMarkingDone}
          onMarkAllDone={handleMarkAllDone}
        />
        <VerifyUrlsTool
          urlsToVerify={urlsToVerify}
          setUrlsToVerify={setUrlsToVerify}
          isVerifying={isVerifying}
          verificationResult={verificationResult}
          onVerify={handleVerifyUrls}
        />
        <CleanupDatabaseTool
          isDeleting={isDeleting}
          onDeleteAllData={handleDeleteAllData}
        />
      </main>
    </div>
  );
}
