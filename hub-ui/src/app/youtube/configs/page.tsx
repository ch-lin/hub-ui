'use client';

import { useDownloaderConfigs } from './hooks/use-downloader-configs';
import { useHubConfigs } from './hooks/use-hub-configs';
import { useConfigTabs } from './hooks/use-config-tabs';
import { DownloaderConfigPanel } from './components/downloader-config-panel';
import { HubConfigPanel } from './components/hub-config-panel';
import { ConfigTabs } from './components/config-tabs';

export default function ConfigsPage() {
  // 🌟 Using custom hooks to get state and settings
  const { activeTab, handleTabChange, isMounted } = useConfigTabs();
  const downloaderConfigsState = useDownloaderConfigs();
  const hubConfigsState = useHubConfigs();

  return (
    <div className="font-sans flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8">
      {isMounted && (
        <>
          {/* Tabs */}
          <ConfigTabs activeTab={activeTab} onTabChange={handleTabChange} />
    
          {/* Use CSS to toggle visibility instead of mounting/unmounting to prevent stuttering */}
          <div className={activeTab === 'downloader' ? 'block' : 'hidden'}>
            <DownloaderConfigPanel {...downloaderConfigsState} />
          </div>
          <div className={activeTab === 'hub' ? 'block' : 'hidden'}>
            <HubConfigPanel {...hubConfigsState} />
          </div>
        </>
      )}
    </div>
  );
}