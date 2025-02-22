import { Button } from '@/shared/ui/button';
import {
  isTaskActive,
  isTaskCompletedAgo,
  isTaskDeleted,
  isTaskInFuture,
  isTaskSelected,
  ListsNames,
  TaskModel,
} from '@/entities/task/model/task';
import { StatusFilterEnum, useFilterStore } from '@/_pages/tasks-todo/model/filterStore';
import { MainBlock } from './MainBlock';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import dayjs from 'dayjs';

export function useSortedTasks(tasks: TaskModel[]) {
  const statusFilter = useFilterStore((store) => store.statusFilter);

  return statusFilter == StatusFilterEnum.FUTURE ? sortTasksByDate(tasks) : tasks;
}

export function useApplyFilters(tasks: TaskModel[]) {
  const { statusFilter, list } = useFilterStore();

  return tasks
    .filter((task) => !isTaskDeleted(task) && !isTaskCompletedAgo(task))
    .filter((task) => applyStatusFilter(task, statusFilter))
    .filter((task) => list === '' || task.list === list);
}

function applyStatusFilter(task: TaskModel, filter: StatusFilterEnum) {
  switch (filter) {
    case StatusFilterEnum.ACTIVE:
      return isTaskActive(task);
    case StatusFilterEnum.FUTURE:
      return isTaskInFuture(task);
    case StatusFilterEnum.SELECTED:
      return isTaskSelected(task);
  }
}

export function Filters() {
  return (
    <MainBlock title="Filters">
      <SpecialFiltersGroup />
      <ListFiltersGroup />
    </MainBlock>
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
    <div className="flex gap-2">
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

function sortTasksByDate(tasks: TaskModel[]) {
  return tasks.sort((a, b) => unixTime(a.date) - unixTime(b.date));
}

function unixTime(date: Date | null | undefined) {
  return date ? dayjs(date).unix() : 0;
}
