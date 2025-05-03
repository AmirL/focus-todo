import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { ListsNames } from '@/entities/task/model/task';

type Props = {
  selectedList: string;
  setSelectedList: (list: string) => void;
};

export function SelectTaskCategory({ selectedList, setSelectedList }: Props) {
  return (
    <Select value={selectedList} onValueChange={setSelectedList}>
      <SelectTrigger id="task-list" className="w-[140px] h-8">
        <SelectValue placeholder="Select a list" />
      </SelectTrigger>
      <SelectContent>
        {ListsNames.map((list) => (
          <SelectItem key={list} value={list}>
            {list}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
