import { Link2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VerificationResult {
  newUrls: string | null;
  undownloaded: string | null;
  error: string | null;
}

interface VerifyUrlsToolProps {
  urlsToVerify: string;
  setUrlsToVerify: (urls: string) => void;
  isVerifying: boolean;
  verificationResult: VerificationResult | null;
  onVerify: () => void;
}

export function VerifyUrlsTool({
  urlsToVerify,
  setUrlsToVerify,
  isVerifying,
  verificationResult,
  onVerify,
}: VerifyUrlsToolProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isVerifying && urlsToVerify.trim()) {
        onVerify();
      }
    }
  };

  return (
    <div className="bg-card text-card-foreground p-6 md:p-8 rounded-xl shadow-sm border border-border transition-all hover:shadow-md">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <Link2 className="h-6 w-6 text-blue-500" />
        Verify Video URLs
      </h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Paste a list of YouTube video URLs (one per line) to check their status. <br className="hidden md:block"/>
        <span className="text-blue-600 dark:text-blue-400 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded mt-2 inline-block">
          ✨ Auto-paste from clipboard is active when window is focused. (Press <b>Cmd/Ctrl + Enter</b> to verify)
        </span>
      </p>
      <Textarea 
        value={urlsToVerify} 
        onChange={(e) => setUrlsToVerify(e.target.value)} 
        onKeyDown={handleKeyDown}
        disabled={isVerifying} 
        placeholder="https://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=..." className="h-40 mb-4 font-mono text-sm resize-y" />
      <Button onClick={onVerify} disabled={isVerifying || !urlsToVerify.trim()}>
        {isVerifying ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
        {isVerifying ? "Verifying..." : "Verify URLs"}
      </Button>

      {verificationResult !== null && (
        <div className={`mt-8 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-2 transition-all duration-300 ${isVerifying ? "opacity-50 pointer-events-none grayscale" : ""}`}>
          {verificationResult.error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <Label className="flex items-center gap-2 font-bold text-destructive mb-2"><AlertTriangle className="h-4 w-4" /> Error Occurred</Label>
              <Textarea readOnly value={verificationResult.error} className="h-24 p-0 bg-transparent border-none text-destructive font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block font-semibold mb-2">New URLs (To Add)</Label>
                <Textarea readOnly value={verificationResult.newUrls ?? ""} className="h-32 font-mono text-sm resize-none" />
              </div>
              <div>
                <Label className="block font-semibold mb-2">Undownloaded URLs</Label>
                <Textarea readOnly value={verificationResult.undownloaded ?? ""} className="h-32 font-mono text-sm resize-none" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
