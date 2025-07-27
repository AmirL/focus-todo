import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useListsQuery } from '@/shared/api/lists';

type Props = {
  selectedList: string;
  setSelectedList: (list: string) => void;
};

export function SelectTaskCategory({ selectedList, setSelectedList }: Props) {
  const { data: lists = [], isLoading } = useListsQuery();

  return (
    <Select value={selectedList} onValueChange={setSelectedList} disabled={isLoading}>
      <SelectTrigger id="task-list" className="w-[140px] h-8">
        <SelectValue placeholder={isLoading ? "Loading..." : "Select a list"} />
      </SelectTrigger>
      <SelectContent>
        {lists.map((list) => (
          <SelectItem key={list.id} value={list.name}>
            {list.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
