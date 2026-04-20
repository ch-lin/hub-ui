import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Download, RefreshCw, CheckSquare, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// Define Channel type (we temporarily define it here to ensure this component can operate independently)
export interface Channel {
  channelId: string;
  title: string;
}

// Java 32-bit signed integer max value, used to prevent Spring Boot Pageable size overflow.
const JAVA_MAX_INT = 2147483647; // or (2 ** 31) - 1

export type ViewMode = "available" | "upcoming" | "all" | "deleted";

interface VideoFilterBarProps {
  channels: Channel[];
  selectedChannel: string;
  onChannelChange: (val: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (val: ViewMode) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (val: number) => void;
  forcePublishedAfter: boolean;
  onForcePublishedAfterChange: (val: boolean) => void;
  publishedAfterDate: Date | null;
  onPublishedAfterDateChange: (date: Date | null) => void;
  totalItems: number;
  isFetching: boolean;
  onFetch: () => void;
  onRefresh: () => void;
  isMarkingDone: boolean;
  onMarkAllDone: () => void;
}

export function VideoFilterBar({
  channels,
  selectedChannel,
  onChannelChange,
  viewMode,
  onViewModeChange,
  itemsPerPage,
  onItemsPerPageChange,
  forcePublishedAfter,
  onForcePublishedAfterChange,
  publishedAfterDate,
  onPublishedAfterDateChange,
  totalItems,
  isFetching,
  onFetch,
  onRefresh,
  isMarkingDone,
  onMarkAllDone,
}: VideoFilterBarProps) {
  const targetChannelName = selectedChannel === "all" ? "all available" : channels.find(c => c.channelId === selectedChannel)?.title || "the selected";

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-4 bg-card text-card-foreground p-4 rounded-xl shadow-sm border border-border">
      
      {/* Left section: Channel and Status */}
      <div className="flex items-center gap-2 flex-1 min-w-[280px]">
        <div className="flex-1 min-w-[150px]">
          <Select value={selectedChannel} onValueChange={onChannelChange}>
            <SelectTrigger className="w-full h-10 bg-transparent text-sm">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {channels.map((c) => (
                <SelectItem key={c.channelId} value={c.channelId}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[120px] shrink-0">
          <Select value={viewMode} onValueChange={(val) => onViewModeChange(val as ViewMode)}>
            <SelectTrigger className="w-full h-10 bg-transparent text-sm">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Middle section: Desktop-specific secondary filters */}
      <div className="hidden xl:flex items-center gap-3 flex-wrap">
        <div className="w-[120px] shrink-0">
          <Select value={String(itemsPerPage)} onValueChange={(val) => onItemsPerPageChange(Number(val))}>
            <SelectTrigger className="w-full h-10 bg-transparent text-sm">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
              {selectedChannel !== "all" && <SelectItem value={String(JAVA_MAX_INT)}>All</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <Checkbox id="forcePublishedAfterDesktop" checked={forcePublishedAfter} onCheckedChange={onForcePublishedAfterChange} />
          <Label htmlFor="forcePublishedAfterDesktop" className="text-sm font-medium whitespace-nowrap cursor-pointer">After:</Label>
          <DatePicker selected={publishedAfterDate} onChange={(date: Date | null) => onPublishedAfterDateChange(date)} disabled={!forcePublishedAfter} className="h-10 w-32 px-3 py-2 rounded-md border border-input bg-transparent text-sm disabled:opacity-50 disabled:bg-muted focus:outline-none focus:ring-2 focus:ring-ring" dateFormat="yyyy-MM-dd" />
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
        {totalItems > 0 && <span className="text-sm text-muted-foreground font-medium mr-2 hidden sm:block">Total: {totalItems}</span>}
        
        <Button variant="outline" size="icon" onClick={onFetch} disabled={isFetching} title="Fetch new videos">
          {isFetching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh list">
          <RefreshCw className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="secondary" className="hidden sm:flex" disabled={isMarkingDone}>
              <CheckSquare className="h-4 w-4 mr-2" /> Mark Done
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark All as Done</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark all videos from {targetChannelName} channel(s) as done?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onMarkAllDone}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 🌟 Drawer button (mobile-specific) */}
        <div className="xl:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl px-6 pt-4 pb-12 sm:px-8">
              <SheetHeader>
                <SheetTitle className="text-left text-lg">Filters & Actions</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-base font-medium">Items per page</Label>
                  <Select value={String(itemsPerPage)} onValueChange={(val) => onItemsPerPageChange(Number(val))}>
                    <SelectTrigger className="w-full h-12 bg-transparent text-base">
                      <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                      <SelectItem value="100">100 / page</SelectItem>
                      {selectedChannel !== "all" && <SelectItem value={String(JAVA_MAX_INT)}>All</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="forcePublishedAfterMobile" checked={forcePublishedAfter} onCheckedChange={onForcePublishedAfterChange} />
                    <Label htmlFor="forcePublishedAfterMobile" className="text-base font-medium cursor-pointer">After Date:</Label>
                  </div>
              <DatePicker selected={publishedAfterDate} onChange={(date: Date | null) => onPublishedAfterDateChange(date)} disabled={!forcePublishedAfter} className="h-12 w-full px-4 py-2 rounded-md border border-input bg-transparent text-base disabled:opacity-50 disabled:bg-muted focus:outline-none focus:ring-2 focus:ring-ring" dateFormat="yyyy-MM-dd" placeholderText="Select date..." />
                </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" className="w-full h-12 mt-2 sm:hidden text-base" disabled={isMarkingDone}>
                  <CheckSquare className="h-5 w-5 mr-2" /> Mark Done
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark All as Done</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to mark all videos from {targetChannelName} channel(s) as done?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onMarkAllDone}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
