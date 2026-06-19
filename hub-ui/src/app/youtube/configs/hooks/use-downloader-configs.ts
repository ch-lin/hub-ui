import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { configApi } from "@/lib/api";
import { z } from 'zod';

type AllConfigsResponse = {
  enabledConfigName: string;
  allConfigNames: string[];
};

export const downloaderConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  enabled: z.boolean().default(false),
  duration: z.coerce.number().min(1, "Duration must be at least 1"),
  startDownloadAutomatically: z.boolean().default(true),
  removeCompletedJobAutomatically: z.boolean().default(true),
  clientId: z.string().nullish().transform(v => v ?? ''),
  clientSecret: z.string().nullish().transform(v => v ?? ''),
  threadPoolSize: z.coerce.number().min(1, "Thread pool size must be at least 1"),
  maxQueueSize: z.coerce.number().min(1, "Max queue size must be at least 1"),
  maxDownloadRetries: z.coerce.number().min(0, "Max download retries cannot be negative").default(3),
  ytDlpConfig: z.object({
    name: z.string().nullish().transform(v => v ?? ''),
    formatFiltering: z.string().min(1, "Format filtering is required"),
    formatSorting: z.string().nullish().transform(v => v ?? ''),
    remuxVideo: z.string().nullish().transform(v => v ?? ''),
    writeDescription: z.boolean().default(false),
    writeSubs: z.boolean().default(false),
    subLang: z.string().nullish().transform(v => v ?? ''),
    writeAutoSubs: z.boolean().default(false),
    subFormat: z.string().nullish().transform(v => v ?? ''),
    outputTemplate: z.string().nullish().transform(v => v ?? ''),
    overwrite: z.enum(['DEFAULT', 'FORCE', 'SKIP']).default('DEFAULT'),
    keepVideo: z.boolean().default(false),
    extractAudio: z.boolean().default(false),
    audioFormat: z.string().nullish().transform(v => v ?? ''),
    audioQuality: z.coerce.number().default(0),
    cookie: z.string().nullish().transform(v => v ?? ''),
    noProgress: z.boolean().default(true),
    useCookie: z.boolean().default(false),
    sleepInterval: z.coerce.number().min(0, "Must be >= 0").nullish(),
    maxSleepInterval: z.coerce.number().min(0, "Must be >= 0").nullish(),
    sleepSubtitles: z.coerce.number().min(0, "Must be >= 0").nullish(),
  })
});

export type DownloaderConfigFormValues = z.infer<typeof downloaderConfigSchema>;

export function useDownloaderConfigs() {
  const [downloaderConfigs, setDownloaderConfigs] = useState<string[]>([]);
  const [selectedDownloaderConfig, setSelectedDownloaderConfig] = useState<string>('');
  const [downloaderError, setDownloaderError] = useState<string | null>(null);
  const [downloaderLoading, setDownloaderLoading] = useState(true);

  const [downloaderConfigDetails, setDownloaderConfigDetails] = useState<DownloaderConfigFormValues | null>(null);
  const [downloaderDetailsLoading, setDownloaderDetailsLoading] = useState(false);
  const [downloaderDetailsError, setDownloaderDetailsError] = useState<string | null>(null);
  const [isDownloaderSaving, setIsDownloaderSaving] = useState(false);
  const [isDownloaderDeleting, setIsDownloaderDeleting] = useState(false);
  const [isCreatingNewDownloader, setIsCreatingNewDownloader] = useState(false);
  const [previousSelectedDownloaderConfig, setPreviousSelectedDownloaderConfig] = useState<string>('');

  // Fetch the list of all downloader configurations
  useEffect(() => {
    const fetchDownloaderConfigs = async () => {
      console.info("[Downloader Configs Tracking] Fetching downloader configurations list...");
      const startTime = performance.now();
      try {
        const data: AllConfigsResponse = await configApi.getDownloaderConfigs();
        setDownloaderConfigs(data.allConfigNames || []);
        setSelectedDownloaderConfig(data.enabledConfigName || '');
        setPreviousSelectedDownloaderConfig(data.enabledConfigName || '');
        console.info(`[Downloader Configs Tracking] Successfully fetched downloader configurations in ${(performance.now() - startTime).toFixed(0)}ms.`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setDownloaderError(errorMessage);
        console.error("[Downloader Configs Tracking] Failed to fetch downloader configurations:", err);
        toast.error(`Failed to load downloader configs: ${errorMessage}`);
      } finally {
        setDownloaderLoading(false);
      }
    };

    fetchDownloaderConfigs();
  }, []);

  // Fetch the details of the selected downloader configuration
  useEffect(() => {
    const fetchDownloaderConfigDetails = async () => {
      if (!isCreatingNewDownloader) {
        if (!selectedDownloaderConfig) {
          setDownloaderConfigDetails(null);
          return;
        }

        setDownloaderDetailsLoading(true);
        setDownloaderDetailsError(null);
        console.info(`[Downloader Configs Tracking] Fetching details for downloader config: ${selectedDownloaderConfig}`);
        const startTime = performance.now();
        try {
          const data: DownloaderConfigFormValues = await configApi.getDownloaderConfig(selectedDownloaderConfig);
          setDownloaderConfigDetails(data);
          console.info(`[Downloader Configs Tracking] Successfully fetched details for ${selectedDownloaderConfig} in ${(performance.now() - startTime).toFixed(0)}ms.`);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          setDownloaderDetailsError(errorMessage);
          console.error(`[Downloader Configs Tracking] Failed to fetch details for ${selectedDownloaderConfig}:`, err);
          toast.error(`Failed to load details for "${selectedDownloaderConfig}": ${errorMessage}`);
        } finally {
          setDownloaderDetailsLoading(false);
        }
      }
    };
    fetchDownloaderConfigDetails();
  }, [selectedDownloaderConfig, isCreatingNewDownloader]);

  const handleNewDownloaderClick = () => {
    setPreviousSelectedDownloaderConfig(selectedDownloaderConfig);
    setIsCreatingNewDownloader(true);
    setSelectedDownloaderConfig('');
    setDownloaderConfigDetails({
      name: '',
      enabled: false,
      duration: 10,
      startDownloadAutomatically: true,
      removeCompletedJobAutomatically: true,
      clientId: '',
      clientSecret: '',
      threadPoolSize: 3,
      maxQueueSize: 50,
      maxDownloadRetries: 3,
      ytDlpConfig: {
        name: '',
        formatFiltering: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        formatSorting: '',
        remuxVideo: 'mp4',
        noProgress: true,
        writeDescription: true,
        writeSubs: true,
        subLang: 'ja.*',
        writeAutoSubs: true,
        subFormat: 'srt',
        outputTemplate: '',
        overwrite: 'DEFAULT',
        keepVideo: false,
        extractAudio: false,
        audioFormat: 'm4a',
        audioQuality: 0,
        cookie: '',
        useCookie: false,
        sleepInterval: 5,
        maxSleepInterval: 15,
        sleepSubtitles: 2,
      }
    });
  };

  const handleDownloaderCancel = () => {
    setIsCreatingNewDownloader(false);
    setSelectedDownloaderConfig(previousSelectedDownloaderConfig);
  };

  const handleDownloaderDelete = async () => {
    if (!downloaderConfigDetails || downloaderConfigDetails.name === 'default') {
      toast.error("The 'default' configuration cannot be deleted.");
      return;
    }

    setIsDownloaderDeleting(true);
    const configName = downloaderConfigDetails.name;
    console.info(`[Downloader Configs Tracking] Action: Attempting to delete downloader config: ${configName}`);
    const toastId = toast.loading(`Deleting "${configName}"...`);
    const startTime = performance.now();

    try {
      await configApi.deleteDownloaderConfig(configName);

      toast.success(`Configuration "${configName}" deleted successfully!`, { id: toastId });
      console.info(`[Downloader Configs Tracking] Successfully deleted downloader config: ${configName} in ${(performance.now() - startTime).toFixed(0)}ms`);

      const newConfigs = downloaderConfigs.filter(c => c !== configName);
      setDownloaderConfigs(newConfigs);
      setSelectedDownloaderConfig(newConfigs.length > 0 ? newConfigs[0] : '');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during deletion.';
      toast.error(`Failed to delete "${configName}": ${errorMessage}`, { id: toastId });
      console.error(`[Downloader Configs Tracking] Failed to delete downloader config ${configName}:`, err);
    } finally {
      setIsDownloaderDeleting(false);
    }
  };

  const handleDownloaderSave = async (formData: DownloaderConfigFormValues) => {
    setIsDownloaderSaving(true);

    // Ensure the nested config's name is also synchronized
    formData.ytDlpConfig.name = formData.name;

    const configName = formData.name;
    const wasCreating = isCreatingNewDownloader;
    const action = wasCreating ? 'create' : 'update';
    console.info(`[Downloader Configs Tracking] Action: Attempting to ${action} downloader config: "${configName}"`);
    const toastId = toast.loading(`Saving "${configName}"...`);
    const startTime = performance.now();

    try {
      const responseData = wasCreating
        ? await configApi.createDownloaderConfig(formData)
        : await configApi.updateDownloaderConfig(downloaderConfigDetails!.name, formData);

      const savedData: DownloaderConfigFormValues = responseData.data;

      toast.success(`Configuration "${savedData.name}" saved successfully!`, { id: toastId });
      console.info(`[Downloader Configs Tracking] Successfully ${action}d downloader config: ${savedData.name} in ${(performance.now() - startTime).toFixed(0)}ms`);

      // Update state after successful save
      setDownloaderConfigDetails(savedData);
      if (wasCreating) {
        setIsCreatingNewDownloader(false);
        setDownloaderConfigs(prev => [...prev, savedData.name].sort());
      }
      setSelectedDownloaderConfig(savedData.name);
      setPreviousSelectedDownloaderConfig(savedData.name);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during save.';
      toast.error(`Failed to save "${configName}": ${errorMessage}`, { id: toastId });
      console.error(`[Downloader Configs Tracking] Failed to ${action} downloader config "${configName}":`, err);
    } finally {
      setIsDownloaderSaving(false);
    }
  };

  return {
    downloaderConfigs,
    selectedDownloaderConfig,
    setSelectedDownloaderConfig,
    downloaderError,
    downloaderLoading,
    downloaderConfigDetails,
    downloaderDetailsLoading,
    downloaderDetailsError,
    isDownloaderSaving,
    isDownloaderDeleting,
    isCreatingNewDownloader,
    handleNewDownloaderClick,
    handleDownloaderCancel,
    handleDownloaderDelete,
    handleDownloaderSave,
  };
}
