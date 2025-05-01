import { RefreshCcw, Copy, ClipboardCheck, ClipboardX } from 'lucide-react';
import { ContentSection } from './Section';
import { StatusFilterEnum, useFilterStore } from '@/_pages/tasks-todo/model/filterStore';
import { ListsNames } from '@/entities/task/model/task';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';
import { Button } from '@/shared/ui/button';
import { TaskModel } from '@/entities/task/model/task';
import { useApplyFilters } from '../model/filterTasks';
import { useSortedTasks } from '../model/sortTasks';
import toast from 'react-hot-toast';

export function Filters() {
  const { statusFilter } = useFilterStore();
  const tasksStore = useTasksStore();

  // Check if there are any selected tasks
  const hasSelectedTasks = tasksStore.tasks.some((task) => task.selectedAt && !task.completedAt);

  // Show action buttons when there are tasks to copy or reset
  const showActionButtons = hasSelectedTasks || tasksStore.tasks.length > 0;

  const filteredTasks = useApplyFilters(tasksStore.tasks);
  const tasks = useSortedTasks(filteredTasks);

  const handleCopyAsJson = () => {
    const tasksJson = JSON.stringify(
      tasks.map((task) => TaskModel.toPlain(task)),
      null,
      2
    );
    navigator.clipboard
      .writeText(tasksJson)
      .then(() => {
        toast.success('Tasks copied to clipboard', {
          icon: <ClipboardCheck className="h-5 w-5" />,
        });
      })
      .catch(() => {
        toast.error('Failed to copy tasks', {
          icon: <ClipboardX className="h-5 w-5" />,
        });
      });
  };

  return (
    <>
      <ContentSection title="Filters">
        <div className="flex flex-wrap justify-between gap-6">
          <StatusFiltersGroup />
          <ListFiltersGroup />
        </div>
      </ContentSection>

      {showActionButtons && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyAsJson} className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy as JSON
          </Button>
          {statusFilter === StatusFilterEnum.SELECTED && hasSelectedTasks && <ResetSelectedButton />}
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

function StatusFiltersGroup() {
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

  const handleSetToday = () => {
    setStatusFilter(StatusFilterEnum.TODAY);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Button
        variant={statusFilter === StatusFilterEnum.BACKLOG ? 'default' : 'outline'}
        onClick={handleSetActive}
        size="sm"
        className="px-4"
      >
        Backlog
      </Button>
      <Button
        variant={statusFilter === StatusFilterEnum.SELECTED ? 'default' : 'outline'}
        onClick={handleSetSelected}
        size="sm"
        className="px-4"
      >
        Selected
      </Button>
      <Button
        variant={statusFilter === StatusFilterEnum.TODAY ? 'default' : 'outline'}
        onClick={handleSetToday}
        size="sm"
        className="px-4"
      >
        Today
      </Button>
      <Button
        variant={statusFilter === StatusFilterEnum.TOMORROW ? 'default' : 'outline'}
        onClick={() => setStatusFilter(StatusFilterEnum.TOMORROW)}
        size="sm"
        className="px-4"
      >
        Tomorrow
      </Button>
      <Button
        variant={statusFilter === StatusFilterEnum.FUTURE ? 'default' : 'outline'}
        onClick={handleSetFuture}
        size="sm"
        className="px-4"
      >
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
    <div className="flex gap-3">
      {ListsNames.map((listName) => (
        <Button
          key={listName}
          variant={list === listName ? 'default' : 'outline'}
          onClick={() => handleSetList(listName)}
          size="sm"
          className="px-4"
        >
          {listName}
        </Button>
      ))}
    </div>
  );
}
