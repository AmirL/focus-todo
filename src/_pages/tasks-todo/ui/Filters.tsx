import { RefreshCcw } from 'lucide-react';
import { ContentSection } from './Section';
import { StatusFilterEnum, useFilterStore } from '@/_pages/tasks-todo/model/filterStore';
import { ListsNames } from '@/entities/task/model/task';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';
import { Button } from '@/shared/ui/button';

export function Filters() {
  const { statusFilter } = useFilterStore();
  const tasksStore = useTasksStore();

  // Check if there are any selected tasks
  const hasSelectedTasks = tasksStore.tasks.some((task) => task.selectedAt && !task.completedAt);

  // Show reset button only when Selected filter is active and there are selected tasks
  const showResetButton = statusFilter === StatusFilterEnum.SELECTED && hasSelectedTasks;

  return (
    <>
      <ContentSection title="Filters">
        <div className="flex flex-wrap justify-between gap-4">
          <SpecialFiltersGroup />
          <ListFiltersGroup />
        </div>
      </ContentSection>

      {showResetButton && (
        <div className="mt-3 flex justify-end">
          <ResetSelectedButton />
        </div>
      )}
    </>
  );
}

function ResetSelectedButton() {
  const tasksStore = useTasksStore();

  const resetAllSelected = async () => {
    const selectedTasks = tasksStore.tasks.filter((task) => task.selectedAt && !task.completedAt);

    for (const task of selectedTasks) {
      const updatedTask = tasksStore.updateTask(task.id, { selectedAt: null });
      await updateTaskMutation(updatedTask);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={resetAllSelected} className="text-yellow-500 hover:text-yellow-600">
      <RefreshCcw className="h-4 w-4 mr-1" />
      Reset All Selected Tasks
    </Button>
  );
}

function SpecialFiltersGroup() {
  const { statusFilter, setStatusFilter } = useFilterStore();

  const handleSetActive = () => {
    setStatusFilter(StatusFilterEnum.BACKLOG);
  };

  const handleSetSelected = () => {
    setStatusFilter(StatusFilterEnum.SELECTED);
  };

  const handleSetFuture = () => {
    setStatusFilter(StatusFilterEnum.FUTURE);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button variant={statusFilter === StatusFilterEnum.BACKLOG ? 'default' : 'outline'} onClick={handleSetActive}>
        Backlog
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
