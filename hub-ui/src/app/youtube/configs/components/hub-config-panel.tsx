import { useMemo, useEffect } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, CheckboxField, SecretInput } from './form-fields';
import { ConfigFormSkeleton } from './config-form-skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { hubConfigSchema, type HubConfigFormValues, type useHubConfigs } from '../hooks/use-hub-configs';

export type HubConfigPanelProps = ReturnType<typeof useHubConfigs>;

export function HubConfigPanel({
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
}: HubConfigPanelProps) {

  // 1. Prepare perfectly formatted data, ensuring Scheduler Type is never empty
  const formValues = useMemo(() => {
    if (!hubConfigDetails) return undefined;
    
    // Ensure the string from the backend accurately maps to the SelectItem's value
    const rawType = hubConfigDetails.schedulerType?.toUpperCase() || '';
    const schedulerType = rawType.includes('CRON') ? 'CRON' : 'FIXED_RATE';

    return {
      ...hubConfigDetails,
      schedulerType,
    };
  }, [hubConfigDetails]);

  // 2. Revert to using an explicit useEffect reset, as RHF's values property can easily cause state synchronization issues when handling controlled Select components
  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm<HubConfigFormValues>({
    resolver: zodResolver(hubConfigSchema) as Resolver<HubConfigFormValues>,
    defaultValues: {
      schedulerType: 'FIXED_RATE',
    },
  });

  useEffect(() => {
    if (formValues) { 
      reset(formValues);
    }
  }, [formValues, reset]);

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Failed to save. Please check the form for errors.");
  };

  const schedulerType = watch('schedulerType');
  const isCron = schedulerType === 'CRON';

  return (
    <> 
      {/* Hub Config Control Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-4 sm:p-6 rounded-xl shadow-sm border border-border">
        <div className="flex w-full sm:w-auto items-center gap-3 flex-1">
          <label className="text-sm font-semibold text-foreground shrink-0">Profile</label>
          {hubLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading profiles...</span>
            </div>
          ) : hubError ? (
            <span className="text-sm text-destructive">Error: {hubError}</span>
          ) : (
            <Select value={selectedHubConfig} onValueChange={setSelectedHubConfig} disabled={isCreatingNewHub}>
              <SelectTrigger className="w-full sm:max-w-[250px]">
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                {hubConfigs.map((config) => (<SelectItem key={config} value={config}>{config}</SelectItem>))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 mt-2 sm:mt-0">
          {isCreatingNewHub ? (
            <Button variant="secondary" onClick={handleHubCancel}>Cancel</Button>
          ) : (
            <Button variant="outline" onClick={handleNewHubClick}>
              <Plus className="h-4 w-4 mr-2" /> New
            </Button>
          )}
          <Button onClick={handleSubmit(handleHubSave, onInvalid)} disabled={isHubSaving || !hubConfigDetails}>
            {isHubSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" disabled={isHubDeleting || !hubConfigDetails || isCreatingNewHub || selectedHubConfig === 'default'}>
                {isHubDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the "{hubConfigDetails?.name}" configuration.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleHubDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {hubDetailsLoading && <ConfigFormSkeleton />}
      {hubDetailsError && <p className="mt-4 text-destructive">Error: {hubDetailsError}</p>}
      
      {hubConfigDetails && !hubDetailsLoading && !hubDetailsError && (
        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <Field label="Configuration Name">
              <Input {...register('name')} readOnly={!isCreatingNewHub} className={!isCreatingNewHub ? 'bg-muted text-muted-foreground' : ''} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </Field>

            <Controller control={control} name="enabled" render={({ field }) => (
              <CheckboxField label="Enabled">
                <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
              </CheckboxField>
            )} />

            <Field label="YouTube API Key" colSpan={2}>
              <SecretInput {...register('youtubeApiKey')} className="font-mono" />
              {errors.youtubeApiKey && <p className="text-xs text-destructive mt-1">{errors.youtubeApiKey.message}</p>}
            </Field>

            <Field label="Daily Quota">
              <Input type="number" {...register('quota')} />
              {errors.quota && <p className="text-xs text-destructive mt-1">{errors.quota.message}</p>}
            </Field>
            <Field label="Quota Safety Threshold">
              <Input type="number" {...register('quotaSafetyThreshold')} />
              {errors.quotaSafetyThreshold && <p className="text-xs text-destructive mt-1">{errors.quotaSafetyThreshold.message}</p>}
            </Field>
            <Field label="API Call Delay (ms)">
              <Input type="number" {...register('apiCallDelay')} />
              {errors.apiCallDelay && <p className="text-xs text-destructive mt-1">{errors.apiCallDelay.message}</p>}
            </Field>
            <Field label="Active Videos Sync (Days)">
              <Input type="number" {...register('activeVideosSyncDays')} />
              {errors.activeVideosSyncDays && <p className="text-xs text-destructive mt-1">{errors.activeVideosSyncDays.message}</p>}
            </Field>
          <Field label="Max Thumbnail Retries">
            <Input type="number" {...register('maxThumbnailRetries')} />
            {errors.maxThumbnailRetries && <p className="text-xs text-destructive mt-1">{errors.maxThumbnailRetries.message}</p>}
          </Field>

            <div className="col-span-1 md:col-span-2 border-t border-border my-2"></div>

            <Field label="Client ID (Downloader API)">
              <Input {...register('clientId')} className="font-mono" />
            </Field>
            <Field label="Client Secret (Downloader API)">
              <SecretInput {...register('clientSecret')} className="font-mono" />
            </Field>

            <div className="col-span-1 md:col-span-2 border-t border-border my-2">
              <span className="text-sm font-bold text-muted-foreground bg-card pr-2 relative -top-3">Scheduler Settings</span>
            </div>

            {/* Auto Start Checkbox takes full width */}
            <div className="col-span-1 md:col-span-2 -mt-4">
               <Controller control={control} name="autoStartFetchScheduler" render={({ field }) => (
                 <CheckboxField label="Auto Start Fetch Scheduler">
                   <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                 </CheckboxField>
               )} />
            </div>

            <Controller control={control} name="schedulerType" render={({ field }) => {
              // Bulletproof fallback: Force filter out all empty strings or undefined, ensuring it's always one of these two valid values
              const safeValue = field.value === 'CRON' ? 'CRON' : 'FIXED_RATE';
              return (
                <Field label="Scheduler Type">
                  <Select value={safeValue} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED_RATE">Fixed Rate</SelectItem>
                      <SelectItem value="CRON">Cron</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              );
            }} />

            {/* Remaining fields flow naturally in the grid */}
            {!isCron ? (
              <Field label="Fixed Rate (ms)">
                <Input type="number" {...register('fixedRate')} className="font-mono" />
                {errors.fixedRate && <p className="text-xs text-destructive mt-1">{errors.fixedRate.message}</p>}
              </Field>
            ) : (
              <>
                <Field label="Cron Expression">
                  <Input {...register('cronExpression')} className="font-mono" placeholder="0 0 8 * * *" />
                </Field>
                <Controller control={control} name="cronTimeZone" render={({ field }) => (
                  <Field label="Cron Time Zone">
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select Time Zone" /></SelectTrigger>
                      <SelectContent>
                        {timeZones.map((tz) => (<SelectItem key={tz.id} value={tz.id}>{tz.displayName}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </Field>
                )} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
