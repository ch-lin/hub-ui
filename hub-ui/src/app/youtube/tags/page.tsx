"use client";

import { useTags } from './hooks/use-tags';
import { TagActionBar } from './components/tag-action-bar';
import { TagList } from './components/tag-list';

export default function TagsPage() {
  const {
    tags,
    loading,
    error,
    deletingTagId,
    newTagName,
    setNewTagName,
    isAdding,
    fetchTags,
    handleCreateTag,
    handleDelete,
  } = useTags();

  return (
    <div className="font-sans flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <TagActionBar 
        newTagName={newTagName}
        setNewTagName={setNewTagName}
        isAdding={isAdding}
        onCreateTag={handleCreateTag}
        totalTags={tags.length}
        loading={loading}
        onRefresh={fetchTags}
      />
      <TagList 
        tags={tags}
        loading={loading}
        error={error}
        deletingTagId={deletingTagId}
        onDelete={handleDelete}
      />
    </div>
  );
}
