import { useState, useEffect } from 'react';

export type ConfigTab = 'downloader' | 'hub';

export function useConfigTabs() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('downloader');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedTab = localStorage.getItem('activeConfigTab');
    if (savedTab === 'downloader' || savedTab === 'hub') {
      setActiveTab(savedTab as ConfigTab);
    }
    setIsMounted(true);
  }, []);

  const handleTabChange = (tab: ConfigTab) => {
    setActiveTab(tab);
    localStorage.setItem('activeConfigTab', tab);
    console.info(`[Configs Tracking] User switched to tab: ${tab}`);
  };

  return { activeTab, handleTabChange, isMounted };
}
