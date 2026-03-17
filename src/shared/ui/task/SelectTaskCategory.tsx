import { useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useListsQuery } from '@/shared/api/lists';

type Props = {
  selectedListId: number | null;
  setSelectedListId: (listId: number) => void;
};

export function SelectTaskCategory({ selectedListId, setSelectedListId }: Props) {
  const { data: lists = [], isLoading } = useListsQuery();
  const defaultAppliedRef = useRef(false);

  // Intentional: auto-select first list when no selection exists (e.g. Add Task form).
  // This is a deliberate default initialization performed here rather than in the parent,
  // because the available lists are loaded asynchronously via useListsQuery.
  // Ref guard prevents re-triggering after the parent resets.
  useEffect(() => {
    if (selectedListId == null && lists.length > 0 && !defaultAppliedRef.current) {
      defaultAppliedRef.current = true;
      setSelectedListId(Number(lists[0].id));
    }
    if (selectedListId != null) {
      defaultAppliedRef.current = false;
    }
  }, [selectedListId, lists, setSelectedListId]);

  return (
    <Select value={selectedListId != null ? String(selectedListId) : ''} onValueChange={(v) => setSelectedListId(Number(v))} disabled={isLoading}>
      <SelectTrigger id="task-list" className="w-[140px] h-8" data-cy="category-selector">
        <SelectValue placeholder={isLoading ? "Loading..." : "Select a list"} />
      </SelectTrigger>
      <SelectContent>
        {lists.map((list) => (
          <SelectItem key={list.id} value={String(list.id)}>
            {list.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
