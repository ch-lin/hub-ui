import { Plus, RefreshCw, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TagActionBarProps {
  newTagName: string;
  setNewTagName: (name: string) => void;
  isAdding: boolean;
  onCreateTag: () => void;
  totalTags: number;
  loading: boolean;
  onRefresh: () => void;
}

export function TagActionBar({
  newTagName,
  setNewTagName,
  isAdding,
  onCreateTag,
  totalTags,
  loading,
  onRefresh,
}: TagActionBarProps) {
  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-4 bg-card text-card-foreground p-4 rounded-xl shadow-sm border border-border">
      {/* Left section: Add new tag */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (!isAdding && newTagName.trim()) {
            onCreateTag();
          }
        }}
        className="flex items-center gap-2 flex-1 min-w-[280px]"
      >
        <div className="relative flex-1 min-w-[150px] max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <TagIcon className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Add new tag..."
            className="pl-9"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            disabled={isAdding}
          />
        </div>
        <Button type="submit" disabled={isAdding || !newTagName.trim()} className="shrink-0">
          {isAdding ? <RefreshCw className="h-4 w-4 animate-spin sm:mr-2" /> : <Plus className="h-4 w-4 sm:mr-2" />}
          <span className="hidden sm:inline">Add Tag</span>
        </Button>
      </form>

      {/* Right section: Action buttons */}
      <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
        {totalTags > 0 && <span className="text-sm font-medium text-muted-foreground mr-2 hidden sm:block">Total: {totalTags}</span>}
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading} title="Refresh tags">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
