"use client";

import { useTools } from "./hooks/use-tools";
import { MarkAllDoneTool } from "./components/mark-all-done-tool";
import { VerifyUrlsTool } from "./components/verify-urls-tool";
import { CleanupDatabaseTool } from "./components/cleanup-database-tool";
import { SyncThumbnailsTool } from "./components/sync-thumbnails-tool";
import { AutoFetchSchedulerTool } from "./components/auto-fetch-scheduler-tool";
import { CsvTool } from "./components/csv-tool";

export default function ToolsPage() {
  const {
    urlsToVerify,
    setUrlsToVerify,
    isMarkingDone,
    isDeleting,
    isVerifying,
    verificationResult,
    thumbnailStatus,
    isStartingSync,
    isResettingThumbnails,
    isIgnoringThumbnails,
    isExporting,
    isImporting,
    showNotFoundModal,
    setShowNotFoundModal,
    notFoundVideoIds,
    isStartingScheduler,
    isStoppingScheduler,
    schedulerStatus,
    handleMarkAllDone,
    handleDeleteAllData,
    handleVerifyUrls,
    handleStartThumbnailSync,
    handleResetFailedThumbnails,
    handleIgnorePendingThumbnails,
    fetchThumbnailStatus,
    handleStartScheduler,
    handleStopScheduler,
    fetchSchedulerStatus,
    handleExportCsv,
    handleImportCsv,
  } = useTools();

  return (
    <div className="font-sans flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <main className="w-full max-w-4xl mx-auto space-y-6">
        <AutoFetchSchedulerTool
          status={schedulerStatus}
          isStarting={isStartingScheduler}
          isStopping={isStoppingScheduler}
          onStart={handleStartScheduler}
          onStop={handleStopScheduler}
          onRefreshStatus={fetchSchedulerStatus}
        />
        <SyncThumbnailsTool
          status={thumbnailStatus}
          isStartingSync={isStartingSync}
          isResetting={isResettingThumbnails}
          isIgnoring={isIgnoringThumbnails}
          onStartSync={handleStartThumbnailSync}
          onResetFailed={handleResetFailedThumbnails}
          onIgnorePending={handleIgnorePendingThumbnails}
          onRefreshStatus={fetchThumbnailStatus}
        />
        <CsvTool
          isExporting={isExporting}
          isImporting={isImporting}
          onExportCsv={handleExportCsv}
          onImportCsv={handleImportCsv}
          showNotFoundModal={showNotFoundModal}
          setShowNotFoundModal={setShowNotFoundModal}
          notFoundVideoIds={notFoundVideoIds}
        />
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
