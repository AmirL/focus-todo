import { Button } from '@/components/ui/button';
import { isTaskActive, isTaskCompletedAgo, isTaskDeleted, isTaskInFuture, ListsNames, Task } from '@/data-classes/task';
import { StatusFilterEnum, useFilterStore } from '@/store/filterStore';

export function useApplyFilters(tasks: Task[]) {
  const { statusFilter, list } = useFilterStore();

  return tasks
    .filter((task) => !isTaskDeleted(task) && !isTaskCompletedAgo(task))
    .filter((task) => applyStatusFilter(task, statusFilter))
    .filter((task) => list === '' || task.list === list);
}

function applyStatusFilter(task: Task, filter: StatusFilterEnum) {
  switch (filter) {
    case StatusFilterEnum.ACTIVE:
      return isTaskActive(task);
    case StatusFilterEnum.FUTURE:
      return isTaskInFuture(task);
    case StatusFilterEnum.SELECTED:
      return task.starred;
  }
}

export function Filters() {
  return (
    <div className="my-4 flex flex-wrap items-center justify-between gap-4">
      <SpecialFiltersGroup />
      <ListFiltersGroup />
    </div>
  );
}

function SpecialFiltersGroup() {
  const { statusFilter, setStatusFilter } = useFilterStore();

  return (
    <div className="flex gap-2">
      <Button
        variant={statusFilter === StatusFilterEnum.ACTIVE ? 'default' : 'outline'}
        onClick={() => {
          setStatusFilter(StatusFilterEnum.ACTIVE);
        }}
      >
        Active
      </Button>
      <Button
        variant={statusFilter === 'selected' ? 'default' : 'outline'}
        onClick={() => setStatusFilter(StatusFilterEnum.SELECTED)}
      >
        Selected
      </Button>
      <Button
        variant={statusFilter === 'future' ? 'default' : 'outline'}
        onClick={() => setStatusFilter(StatusFilterEnum.FUTURE)}
      >
        Future
      </Button>
    </div>
  );
}

function ListFiltersGroup() {
  const { list, setList } = useFilterStore();

  return (
    <div className="flex gap-2">
      {ListsNames.map((listName) => (
        <Button key={listName} variant={list === listName ? 'default' : 'outline'} onClick={() => setList(listName)}>
          {listName}
        </Button>
      ))}
    </div>
  );
}
