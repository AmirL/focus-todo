import { Button } from '@/shared/ui/button';
import { ListsNames } from '@/shared/model/task';
import { StatusFilterEnum, useFilterStore } from '@/_pages/tasks-todo/model/filterStore';
import { ContentSection } from './Section';
import { useTasksStore } from '@/shared/model/tasksStore';

export function Filters() {
  return (
    <ContentSection title="Filters">
      <div className="flex flex-wrap justify-between gap-4">
        <SpecialFiltersGroup />
        <ListFiltersGroup />
      </div>
    </ContentSection>
  );
}

function SpecialFiltersGroup() {
  const { statusFilter, setStatusFilter } = useFilterStore();

  const handleSetActive = () => {
    setStatusFilter(StatusFilterEnum.ACTIVE);
  };

  const handleSetSelected = () => {
    setStatusFilter(StatusFilterEnum.SELECTED);
  };

  const handleSetFuture = () => {
    setStatusFilter(StatusFilterEnum.FUTURE);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant={statusFilter === StatusFilterEnum.ACTIVE ? 'default' : 'outline'} onClick={handleSetActive}>
        Active
      </Button>
      <Button variant={statusFilter === StatusFilterEnum.SELECTED ? 'default' : 'outline'} onClick={handleSetSelected}>
        Selected
      </Button>
      <Button variant={statusFilter === StatusFilterEnum.FUTURE ? 'default' : 'outline'} onClick={handleSetFuture}>
        Future
      </Button>
    </div>
  );
}

function ListFiltersGroup() {
  const { list, setList } = useFilterStore();

  const setShowTaskList = useTasksStore((state) => state.setShowTaskList);

  const handleSetList = (listName: string) => {
    if (list != listName) {
      setList(listName);
      setShowTaskList(false);
    } else {
      setList('');
      setShowTaskList(true);
    }
  };

  return (
    <div className="flex gap-2">
      {ListsNames.map((listName) => (
        <Button
          key={listName}
          variant={list === listName ? 'default' : 'outline'}
          onClick={() => handleSetList(listName)}
        >
          {listName}
        </Button>
      ))}
    </div>
  );
}
