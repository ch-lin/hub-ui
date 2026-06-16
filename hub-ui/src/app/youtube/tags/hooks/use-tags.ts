import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { tagApi } from '@/lib/api';

export interface Tag {
  id: number;
  name: string;
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchTags = useCallback(async (options?: { showLoading?: boolean }) => {
    const showLoading = options?.showLoading ?? true;
    console.info('[Tags Tracking] Fetching tags...');
    const startTime = performance.now();

    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const data: Tag[] = await tagApi.getTags();
      setTags(data);
      console.info(`[Tags Tracking] Fetched ${data.length} tags in ${(performance.now() - startTime).toFixed(0)}ms`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching tags.";
      setError(errorMessage);
      toast.error("Failed to fetch tags.");
      console.error('[Tags Tracking] Error fetching tags:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreateTag = async () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) {
      toast.warning("Please enter a tag name.");
      return;
    }
    setIsAdding(true);
    console.info(`[Tags Tracking] Action: User creating new tag "${trimmedName}"`);
    const startTime = performance.now();

    try {
      await tagApi.createTag(trimmedName);
      toast.success(`Tag "${trimmedName}" created successfully.`);
      console.info(`[Tags Tracking] Successfully created tag "${trimmedName}" in ${(performance.now() - startTime).toFixed(0)}ms`);
      setNewTagName("");
      await fetchTags({ showLoading: false }); 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to create tag: ${errorMessage}`);
      console.error(`[Tags Tracking] Error creating tag "${trimmedName}":`, err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    setDeletingTagId(tag.id);
    console.info(`[Tags Tracking] Action: User deleting tag "${tag.name}" (ID: ${tag.id})`);
    const startTime = performance.now();

    try {
      await tagApi.deleteTag(tag.name);
      setTags((prevTags) => prevTags.filter((t) => t.id !== tag.id));
      toast.success(`Tag "${tag.name}" deleted successfully.`);
      console.info(`[Tags Tracking] Successfully deleted tag "${tag.name}" in ${(performance.now() - startTime).toFixed(0)}ms`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(`Failed to delete tag "${tag.name}": ${errorMessage}`);
      console.error(`[Tags Tracking] Error deleting tag "${tag.name}" (id: ${tag.id}):`, err);
    } finally {
      setDeletingTagId(null);
    }
  };

  return {
    tags, loading, error, deletingTagId, newTagName, setNewTagName,
    isAdding, fetchTags, handleCreateTag, handleDelete,
  };
}