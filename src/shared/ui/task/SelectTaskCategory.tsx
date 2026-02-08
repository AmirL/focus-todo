import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useListsQuery } from '@/shared/api/lists';

type Props = {
  selectedListId: number | null;
  setSelectedListId: (listId: number) => void;
};

export function SelectTaskCategory({ selectedListId, setSelectedListId }: Props) {
  const { data: lists = [], isLoading } = useListsQuery();

  useEffect(() => {
    if (selectedListId == null && lists.length > 0) {
      setSelectedListId(Number(lists[0].id));
    }
  }, [selectedListId, lists, setSelectedListId]);

  return (
    <Select value={selectedListId != null ? String(selectedListId) : ''} onValueChange={(v) => setSelectedListId(Number(v))} disabled={isLoading}>
      <SelectTrigger id="task-list" className="w-[140px] h-8">
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
