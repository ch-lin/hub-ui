import { useEffect } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
import { downloaderConfigSchema, type DownloaderConfigFormValues, type useDownloaderConfigs } from '../hooks/use-downloader-configs';

export type DownloaderConfigPanelProps = ReturnType<typeof useDownloaderConfigs>;

export function DownloaderConfigPanel({
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
}: DownloaderConfigPanelProps) {

  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm<DownloaderConfigFormValues>({
    resolver: zodResolver(downloaderConfigSchema) as Resolver<DownloaderConfigFormValues>,
  });

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Failed to save. Please check the form for errors.");
  };

  useEffect(() => {
    if (downloaderConfigDetails) {
      reset(downloaderConfigDetails);
    }
  }, [downloaderConfigDetails, reset]);

  const useCookie = watch('ytDlpConfig.useCookie');

  return (
    <> 
      {/* Control Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-4 sm:p-6 rounded-xl shadow-sm border border-border">
        <div className="flex w-full sm:w-auto items-center gap-3 flex-1">
          <label className="text-sm font-semibold text-foreground shrink-0">Profile</label>
          {downloaderLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading profiles...</span>
            </div>
          ) : downloaderError ? (
            <span className="text-sm text-destructive">Error: {downloaderError}</span>
          ) : (
            <Select value={selectedDownloaderConfig} onValueChange={setSelectedDownloaderConfig} disabled={isCreatingNewDownloader}>
              <SelectTrigger className="w-full sm:max-w-[250px]">
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                {downloaderConfigs.map((config) => (<SelectItem key={config} value={config}>{config}</SelectItem>))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 mt-2 sm:mt-0">
          {isCreatingNewDownloader ? (
            <Button variant="secondary" onClick={handleDownloaderCancel}>Cancel</Button>
          ) : (
            <Button variant="outline" onClick={handleNewDownloaderClick}>
              <Plus className="h-4 w-4 mr-2" /> New
            </Button>
          )}
          <Button onClick={handleSubmit(handleDownloaderSave, onInvalid)} disabled={isDownloaderSaving || !downloaderConfigDetails}>
            {isDownloaderSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" disabled={isDownloaderDeleting || !downloaderConfigDetails || isCreatingNewDownloader || selectedDownloaderConfig === 'default'}>
                {isDownloaderDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the "{downloaderConfigDetails?.name}" configuration.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDownloaderDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {downloaderDetailsLoading && <ConfigFormSkeleton />}
      {downloaderDetailsError && <p className="mt-4 text-destructive">Error: {downloaderDetailsError}</p>}
      
      {downloaderConfigDetails && !downloaderDetailsLoading && !downloaderDetailsError && (
        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <Field label="Configuration Name">
              <Input {...register('name')} readOnly={!isCreatingNewDownloader} className={!isCreatingNewDownloader ? 'bg-muted text-muted-foreground' : ''} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </Field>

            <div className="flex flex-wrap gap-6">
              <Controller control={control} name="enabled" render={({ field }) => (
                <CheckboxField label="Enabled">
                  <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                </CheckboxField>
              )} />
              <Controller control={control} name="startDownloadAutomatically" render={({ field }) => (
                <CheckboxField label="Auto Download">
                  <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                </CheckboxField>
              )} />
              <Controller control={control} name="removeCompletedJobAutomatically" render={({ field }) => (
                <CheckboxField label="Auto Cleanup">
                  <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                </CheckboxField>
              )} />
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-border my-2"></div>

            <Field label="Client ID (Main API)">
              <Input {...register('clientId')} className="font-mono" />
            </Field>
            <Field label="Client Secret (Main API)">
              <SecretInput {...register('clientSecret')} className="font-mono" />
            </Field>

            <Field label="Duration">
              <Input type="number" {...register('duration')} onWheel={(e) => (e.target as HTMLInputElement).blur()} />
              {errors.duration && <p className="text-xs text-destructive mt-1">{errors.duration.message}</p>}
            </Field>
            <Field label="Thread Pool Size">
              <Input type="number" {...register('threadPoolSize')} onWheel={(e) => (e.target as HTMLInputElement).blur()} />
              {errors.threadPoolSize && <p className="text-xs text-destructive mt-1">{errors.threadPoolSize.message}</p>}
            </Field>
            <Field label="Max Queue Size">
              <Input type="number" {...register('maxQueueSize')} onWheel={(e) => (e.target as HTMLInputElement).blur()} />
              {errors.maxQueueSize && <p className="text-xs text-destructive mt-1">{errors.maxQueueSize.message}</p>}
            </Field>

            <div className="col-span-1 md:col-span-2 border-t border-border my-2">
              <span className="text-sm font-bold text-muted-foreground bg-card pr-2 relative -top-3">yt-dlp Settings</span>
            </div>

            <Field label="Format Filtering">
              <Input {...register('ytDlpConfig.formatFiltering')} className="font-mono" />
              {errors.ytDlpConfig?.formatFiltering && <p className="text-xs text-destructive mt-1">{errors.ytDlpConfig.formatFiltering.message}</p>}
            </Field>
            <Field label="Format Sorting"><Input {...register('ytDlpConfig.formatSorting')} className="font-mono" /></Field>

            <Field label="Remux Video"><Input {...register('ytDlpConfig.remuxVideo')} className="font-mono" /></Field>
            <Controller control={control} name="ytDlpConfig.overwrite" render={({ field }) => (
              <Field label="Overwrite Files">
                <Select value={field.value || 'DEFAULT'} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEFAULT">Default (Overwrite if from different URL)</SelectItem>
                    <SelectItem value="FORCE">Force Overwrite</SelectItem>
                    <SelectItem value="SKIP">Skip Download (Do not overwrite)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )} />

            <div className="flex flex-wrap gap-x-8 gap-y-4 md:col-span-2">
              <Controller control={control} name="ytDlpConfig.noProgress" render={({ field }) => (<CheckboxField label="Disable Progress Bar"><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></CheckboxField>)} />
              <Controller control={control} name="ytDlpConfig.writeDescription" render={({ field }) => (<CheckboxField label="Write Description"><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></CheckboxField>)} />
              <Controller control={control} name="ytDlpConfig.writeSubs" render={({ field }) => (<CheckboxField label="Write Subtitles"><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></CheckboxField>)} />
              <Controller control={control} name="ytDlpConfig.writeAutoSubs" render={({ field }) => (<CheckboxField label="Write Auto Subtitles"><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></CheckboxField>)} />
            </div>

            <Field label="Subtitle Language"><Input {...register('ytDlpConfig.subLang')} className="font-mono" /></Field>
            <Field label="Subtitle Format"><Input {...register('ytDlpConfig.subFormat')} className="font-mono" /></Field>

            <Field label="Output Template" colSpan={2}><Input {...register('ytDlpConfig.outputTemplate')} className="font-mono" /></Field>

            <div>
              <Controller control={control} name="ytDlpConfig.extractAudio" render={({ field }) => (<CheckboxField label="Extract Audio"><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></CheckboxField>)} />
            </div>
            <div>
              <Controller control={control} name="ytDlpConfig.keepVideo" render={({ field }) => (<CheckboxField label="Keep Intermediate Video"><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></CheckboxField>)} />
            </div>

            <Field label="Audio Format"><Input {...register('ytDlpConfig.audioFormat')} className="font-mono" /></Field>
            <Field label="Audio Quality"><Input type="number" {...register('ytDlpConfig.audioQuality')} onWheel={(e) => (e.target as HTMLInputElement).blur()} /></Field>

            <Field label="Sleep Interval (sec)"><Input type="number" {...register('ytDlpConfig.sleepInterval')} onWheel={(e) => (e.target as HTMLInputElement).blur()} /></Field>
            <Field label="Max Sleep Interval (sec)"><Input type="number" {...register('ytDlpConfig.maxSleepInterval')} onWheel={(e) => (e.target as HTMLInputElement).blur()} /></Field>
            <Field label="Sleep Subtitles (sec)"><Input type="number" {...register('ytDlpConfig.sleepSubtitles')} onWheel={(e) => (e.target as HTMLInputElement).blur()} /></Field>

            <div className="md:col-span-2">
              <Controller control={control} name="ytDlpConfig.useCookie" render={({ field }) => (<CheckboxField label="Use Netscape Cookie File"><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></CheckboxField>)} />
            </div>
            {useCookie && (<Field label="Cookie Content" colSpan={2}><Textarea {...register('ytDlpConfig.cookie')} rows={6} className="font-mono text-xs" placeholder="# Netscape HTTP Cookie File..." /></Field>)}
          </div>
        </div>
      )}
    </>
  );
}
