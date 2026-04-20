import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { configApi } from "@/lib/api";
import { z } from 'zod';

type AllConfigsResponse = {
  enabledConfigName: string;
  allConfigNames: string[];
};

export const hubConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  enabled: z.boolean().default(false),
  youtubeApiKey: z.string().min(1, "YouTube API Key is required"),
  clientId: z.string().nullish().transform(v => v ?? ''),
  clientSecret: z.string().nullish().transform(v => v ?? ''),
  quota: z.coerce.number().min(1, "Must be at least 1"),
  quotaSafetyThreshold: z.coerce.number().min(0, "Must be >= 0"),
  apiCallDelay: z.coerce.number().min(0, "Must be >= 0"),
  activeVideosSyncDays: z.coerce.number().min(1, "Must be >= 1"),
  autoStartFetchScheduler: z.boolean().default(false),
  schedulerType: z.string().default('FIXED_RATE'),
  fixedRate: z.coerce.number().nullish().transform(v => v ?? 86400000),
  cronExpression: z.string().nullish().transform(v => v ?? ''),
  cronTimeZone: z.string().nullish().transform(v => v ?? ''),
});

export type HubConfigFormValues = z.infer<typeof hubConfigSchema>;

export type TimeZoneOption = {
  id: string;
  displayName: string;
};

export function useHubConfigs() {
  const [hubConfigs, setHubConfigs] = useState<string[]>([]);
  const [selectedHubConfig, setSelectedHubConfig] = useState<string>('');
  const [hubError, setHubError] = useState<string | null>(null);
  const [hubLoading, setHubLoading] = useState(true);

  const [hubConfigDetails, setHubConfigDetails] = useState<HubConfigFormValues | null>(null);
  const [hubDetailsLoading, setHubDetailsLoading] = useState(false);
  const [hubDetailsError, setHubDetailsError] = useState<string | null>(null);
  const [isHubSaving, setIsHubSaving] = useState(false);
  const [isHubDeleting, setIsHubDeleting] = useState(false);
  const [isCreatingNewHub, setIsCreatingNewHub] = useState(false);
  const [previousSelectedHubConfig, setPreviousSelectedHubConfig] = useState<string>('');
  const [timeZones, setTimeZones] = useState<TimeZoneOption[]>([]);

  // Fetch initial data on mount
  useEffect(() => {
    const fetchHubConfigs = async () => {
      console.info("[Hub Configs Tracking] Fetching hub configurations list...");
      const startTime = performance.now();
      try {
        const data: AllConfigsResponse = await configApi.getHubConfigs();
        setHubConfigs(data.allConfigNames || []);
        setSelectedHubConfig(data.enabledConfigName || '');
        setPreviousSelectedHubConfig(data.enabledConfigName || '');
        console.info(`[Hub Configs Tracking] Successfully fetched hub configurations in ${(performance.now() - startTime).toFixed(0)}ms.`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setHubError(errorMessage);
        console.error("[Hub Configs Tracking] Failed to fetch hub configurations:", err);
        toast.error(`Failed to load hub configs: ${errorMessage}`);
      } finally {
        setHubLoading(false);
      }
    };

    const fetchTimeZones = async () => {
      console.info("[Hub Configs Tracking] Fetching time zones...");
      const startTime = performance.now();
      try {
        const data = await configApi.getHubTimeZones();
        setTimeZones(data);
        console.info(`[Hub Configs Tracking] Successfully fetched time zones in ${(performance.now() - startTime).toFixed(0)}ms.`);
      } catch (error) {
        console.error("[Hub Configs Tracking] Failed to fetch time zones", error);
        toast.warning("Could not load time zones for cron configuration.");
      }
    };

    fetchHubConfigs();
    fetchTimeZones();
  }, []);

  // Fetch the details of the selected hub configuration
  useEffect(() => {
    const fetchHubConfigDetails = async () => {
      if (!isCreatingNewHub) {
        if (!selectedHubConfig) {
          setHubConfigDetails(null);
          return;
        }

        setHubDetailsLoading(true);
        setHubDetailsError(null);
        console.info(`[Hub Configs Tracking] Fetching details for hub config: ${selectedHubConfig}`);
        const startTime = performance.now();
        try {
          const data = await configApi.getHubConfig(selectedHubConfig);
          setHubConfigDetails(data);
          console.info(`[Hub Configs Tracking] Successfully fetched details for ${selectedHubConfig} in ${(performance.now() - startTime).toFixed(0)}ms.`);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          setHubDetailsError(errorMessage);
          console.error(`[Hub Configs Tracking] Failed to fetch details for ${selectedHubConfig}:`, err);
          toast.error(`Failed to load details for "${selectedHubConfig}": ${errorMessage}`);
        } finally {
          setHubDetailsLoading(false);
        }
      }
    };
    fetchHubConfigDetails();
  }, [selectedHubConfig, isCreatingNewHub]);

  const handleNewHubClick = () => {
    setPreviousSelectedHubConfig(selectedHubConfig);
    setIsCreatingNewHub(true);
    setSelectedHubConfig('');
    setHubConfigDetails({
      name: '',
      enabled: false,
      youtubeApiKey: '',
      clientId: '',
      clientSecret: '',
      autoStartFetchScheduler: false,
      schedulerType: 'CRON',
      fixedRate: 86400000,
      cronExpression: '0 0 9,15,21 * * *',
      cronTimeZone: 'Asia/Taipei',
      quota: 10000,
      quotaSafetyThreshold: 500,
      apiCallDelay: 100,
      activeVideosSyncDays: 30
    });
  };

  const handleHubCancel = () => {
    setIsCreatingNewHub(false);
    setSelectedHubConfig(previousSelectedHubConfig);
  };

  const handleHubDelete = async () => {
    if (!hubConfigDetails || hubConfigDetails.name === 'default') {
      toast.error("The 'default' configuration cannot be deleted.");
      return;
    }

    setIsHubDeleting(true);
    const configName = hubConfigDetails.name;
    console.info(`[Hub Configs Tracking] Action: Attempting to delete hub config: ${configName}`);
    const toastId = toast.loading(`Deleting "${configName}"...`);
    const startTime = performance.now();

    try {
      await configApi.deleteHubConfig(configName);

      toast.success(`Configuration "${configName}" deleted successfully!`, { id: toastId });
      console.info(`[Hub Configs Tracking] Successfully deleted hub config: ${configName} in ${(performance.now() - startTime).toFixed(0)}ms`);

      const newConfigs = hubConfigs.filter(c => c !== configName);
      setHubConfigs(newConfigs);
      setSelectedHubConfig(newConfigs.length > 0 ? newConfigs[0] : '');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during deletion.';
      toast.error(`Failed to delete "${configName}": ${errorMessage}`, { id: toastId });
      console.error(`[Hub Configs Tracking] Failed to delete hub config ${configName}:`, err);
    } finally {
      setIsHubDeleting(false);
    }
  };

  const handleHubSave = async (formData: HubConfigFormValues) => {
    setIsHubSaving(true);
    const configName = formData.name;
    const wasCreating = isCreatingNewHub;
    const action = wasCreating ? 'create' : 'update';
    console.info(`[Hub Configs Tracking] Action: Attempting to ${action} hub config: "${configName}"`);
    const toastId = toast.loading(`Saving "${configName}"...`);
    const startTime = performance.now();

    try {
      const responseData = wasCreating
        ? await configApi.createHubConfig(formData)
        : await configApi.updateHubConfig(hubConfigDetails!.name, formData);

      const savedData = responseData.data;

      toast.success(`Configuration "${savedData.name}" saved successfully!`, { id: toastId });
      console.info(`[Hub Configs Tracking] Successfully ${action}d hub config: ${savedData.name} in ${(performance.now() - startTime).toFixed(0)}ms`);

      // Update state after successful save
      setHubConfigDetails(savedData);
      if (wasCreating) {
        setIsCreatingNewHub(false);
        setHubConfigs(prev => [...prev, savedData.name].sort());
      }
      setSelectedHubConfig(savedData.name);
      setPreviousSelectedHubConfig(savedData.name);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during save.';
      toast.error(`Failed to save "${configName}": ${errorMessage}`, { id: toastId });
      console.error(`[Hub Configs Tracking] Failed to ${action} hub config "${configName}":`, err);
    } finally {
      setIsHubSaving(false);
    }
  };

  return {
    hubConfigs,
    selectedHubConfig,
    setSelectedHubConfig,
    hubError,
    hubLoading,
    hubConfigDetails,
    hubDetailsLoading,
    hubDetailsError,
    isHubSaving,
    isHubDeleting,
    isCreatingNewHub,
    timeZones,
    handleNewHubClick,
    handleHubCancel,
    handleHubDelete,
    handleHubSave,
  };
}
