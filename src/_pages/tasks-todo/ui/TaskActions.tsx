import { RefreshCcw, Copy, ClipboardCheck, ClipboardX } from 'lucide-react';
import { ContentSection } from './Section';
import { StatusFilterEnum, useFilterStore } from '@/_pages/tasks-todo/model/filterStore';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';
import { Button } from '@/shared/ui/button';
import { TaskModel } from '@/entities/task/model/task';
import { useApplyFilters } from '../model/filterTasks';
import { useSortedTasks } from '../model/sortTasks';
import toast from 'react-hot-toast';

export function TaskActions() {
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
