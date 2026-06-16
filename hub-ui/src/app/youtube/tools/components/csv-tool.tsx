import { useState, useRef } from "react";
import { FileUp, FileDown, RefreshCw, Copy, UploadCloud, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CsvToolProps {
  isExporting: boolean;
  isImporting: boolean;
  onExportCsv: () => void;
  onImportCsv: (file: File) => void;
  showNotFoundModal: boolean;
  setShowNotFoundModal: (show: boolean) => void;
  notFoundVideoIds: string[];
}

export function CsvTool({ isExporting, isImporting, onExportCsv, onImportCsv, showNotFoundModal, setShowNotFoundModal, notFoundVideoIds }: CsvToolProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImportClick = () => {
    if (selectedFile) {
      setShowConfirmModal(true);
    }
  };

  const executeImport = () => {
    if (selectedFile) {
      onImportCsv(selectedFile);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      setShowConfirmModal(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast.error("Please select a valid CSV file.");
      }
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopyIds = async () => {
    try {
      await navigator.clipboard.writeText(notFoundVideoIds.join('\n'));
      toast.success("IDs copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy IDs to clipboard.");
    }
  };

  return (
    <div className="bg-card text-card-foreground p-6 md:p-8 rounded-xl shadow-sm border border-border transition-all hover:shadow-md">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <FileDown className="h-6 w-6 text-blue-500" />
        Video Properties Management
      </h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Export video properties to a CSV file or import an existing CSV to update current processing statuses, width, and height.
        <br />
        <span className="text-yellow-600 dark:text-yellow-500 mt-1 inline-block">
          * Note: Adding new video records via CSV is not supported at this time.
        </span>
      </p>

      <div className="flex flex-col gap-6 max-w-sm">
        {/* Export Section */}
        <Button
          onClick={onExportCsv}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
        >
          {isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {isExporting ? "Exporting..." : "Export All to CSV"}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Import Section */}
        <div className="flex flex-col gap-3">
          {/* Hidden native file input */}
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

          {!selectedFile ? (
            /* Drag-and-drop zone (Dropzone) */
            <div
              className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer text-center
                ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/10"}
                ${isImporting ? "opacity-50 pointer-events-none" : ""}`}
              onClick={handleBrowseClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadCloud className={`h-8 w-8 mb-3 ${isDragging ? "text-blue-500" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium mb-1">Click or drag CSV here</p>
              <p className="text-xs text-muted-foreground">Only .csv files are supported</p>
            </div>
          ) : (
            /* Selected file status card (File Card) */
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md shrink-0">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate" title={selectedFile.name}>{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleClearFile}
                disabled={isImporting}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button onClick={handleImportClick} disabled={!selectedFile || isImporting} variant="secondary" className="w-full flex items-center justify-center gap-2">
            {isImporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {isImporting ? "Importing..." : "Import from CSV"}
          </Button>
        </div>
      </div>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to import this CSV file? This action will overwrite the current processing statuses, width, and height of the existing video records. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeImport} className="bg-blue-600 text-white hover:bg-blue-700">
              Yes, Import Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Not Found / Skipped Items Dialog */}
      <AlertDialog open={showNotFoundModal} onOpenChange={setShowNotFoundModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Import Completed with Skipped Items</AlertDialogTitle>
            <AlertDialogDescription>
              The following {notFoundVideoIds.length} video IDs were skipped because they could not be found in the database:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[50vh] overflow-y-auto rounded-md bg-muted p-4 text-sm font-mono whitespace-pre-wrap break-all border border-border mt-2">
            {notFoundVideoIds.join('\n')}
          </div>
          <AlertDialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleCopyIds} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy All IDs
            </Button>
            <AlertDialogAction onClick={() => setShowNotFoundModal(false)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}