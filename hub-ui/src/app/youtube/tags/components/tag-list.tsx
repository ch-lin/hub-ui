import { RefreshCw, X, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tag } from '../hooks/use-tags';
import { TagListSkeleton } from './tag-skeletons';
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

interface TagListProps {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  deletingTagId: number | null;
  onDelete: (tag: Tag) => void;
}

export function TagList({ tags, loading, error, deletingTagId, onDelete }: TagListProps) {
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-medium">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border min-h-[200px]">
      {loading ? (
        <TagListSkeleton />
      ) : tags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <span 
              key={tag.id} 
              className={`group flex items-center bg-secondary hover:bg-secondary/80 border border-border text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                deletingTagId === tag.id ? "opacity-50 pointer-events-none grayscale" : ""
              }`}
            >
              <TagIcon className="h-3 w-3 mr-1.5 text-muted-foreground" />
              {tag.name}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingTagId === tag.id} 
                    className="ml-1.5 h-5 w-5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20" 
                    title={`Delete tag ${tag.name}`}
                  >
                    {deletingTagId === tag.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the tag "{tag.name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(tag)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
          <TagIcon className="h-12 w-12 opacity-20 mb-3" />
          <p>No tags found. Add your first tag above!</p>
        </div>
      )}
    </div>
  );
}
