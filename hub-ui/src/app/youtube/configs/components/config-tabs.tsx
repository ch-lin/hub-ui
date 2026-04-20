import { Settings, Server } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ConfigTab } from '../hooks/use-config-tabs';

interface ConfigTabsProps {
  activeTab: ConfigTab;
  onTabChange: (tab: ConfigTab) => void;
}

export function ConfigTabs({ activeTab, onTabChange }: ConfigTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ConfigTab)} className="w-full">
      <TabsList className="flex w-full justify-start gap-2 border-b border-border pb-2 overflow-x-auto no-scrollbar bg-transparent p-0 h-auto rounded-none">
        <TabsTrigger
          value="downloader"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-colors whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted data-[state=active]:shadow-none"
        >
          <Server className="h-4 w-4" />
          Downloader Configs
        </TabsTrigger>
        <TabsTrigger
          value="hub"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-colors whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted data-[state=active]:shadow-none"
        >
          <Settings className="h-4 w-4" />
          YouTube Hub Configs
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
