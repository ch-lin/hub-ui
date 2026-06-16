"use client";

import { useChannels } from "./hooks/use-channels";
import { ChannelActionBar } from "./components/channel-action-bar";
import { DesktopChannelTable } from "./components/desktop-channel-table";
import { MobileChannelList } from "./components/mobile-channel-list";

export default function ChannelsPage() {
  const {
    channels,
    loading,
    error,
    deletingChannels,
    newChannelUrl,
    setNewChannelUrl,
    isAdding,
    handleRefresh,
    handleAddChannel,
    handleDelete,
  } = useChannels();

  return (
    <div className="font-sans flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8">
      
      <ChannelActionBar
        newChannelUrl={newChannelUrl}
        setNewChannelUrl={setNewChannelUrl}
        isAdding={isAdding}
        onAddChannel={handleAddChannel}
        totalChannels={channels.length}
        loading={loading}
        onRefresh={handleRefresh}
      />
      
      <DesktopChannelTable
        channels={channels}
        loading={loading}
        error={error}
        deletingChannels={deletingChannels}
        onDelete={handleDelete}
      />

      <MobileChannelList
        channels={channels}
        loading={loading}
        error={error}
        deletingChannels={deletingChannels}
        onDelete={handleDelete}
      />
    </div>
  );
}
