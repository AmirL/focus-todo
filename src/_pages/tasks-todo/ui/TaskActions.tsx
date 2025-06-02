import { RefreshCcw, Copy, ClipboardCheck, ClipboardX } from 'lucide-react';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { useTasksQuery, useUpdateTaskMutation } from '@/shared/api/tasks';
import { Button } from '@/shared/ui/button';
import { TaskModel, isTaskDeleted } from '@/entities/task/model/task';
import { useApplyFilters } from '@/features/tasks/filter/model/filterTasks';
import { useSortedTasks } from '../model/sortTasks';
import toast from 'react-hot-toast';
import { createInstance } from '@/shared/lib/instance-tools';

export function TaskActions() {
  const { statusFilter } = useFilterStore();
  const { data: allTasks = [] } = useTasksQuery();

  const filteredTasksForDisplay = useApplyFilters(allTasks);
  const sortedTasksForDisplay = useSortedTasks(filteredTasksForDisplay);

  const hasSelectedTasks = sortedTasksForDisplay.some((task) => task.selectedAt && !task.completedAt);

  const showActionButtons = hasSelectedTasks || sortedTasksForDisplay.length > 0;

  const handleCopyAsJson = () => {
    const tasksToCopy = sortedTasksForDisplay.filter((task) => !isTaskDeleted(task));

    if (tasksToCopy.length === 0) {
      toast.error('No tasks in the current view to copy');
      return;
    }

    const tasksJson = JSON.stringify(
      tasksToCopy.map((task) => TaskModel.toPlain(task)),
      null,
      2
    );
    navigator.clipboard
      .writeText(tasksJson)
      .then(() => {
        toast.success('Visible tasks copied to clipboard', {
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
  const { data: allTasks = [] } = useTasksQuery();
  const updateTaskMutation = useUpdateTaskMutation();

  const resetAllSelected = async () => {
    const selectedTasks = allTasks.filter((task) => task.selectedAt && !task.completedAt);

    for (const task of selectedTasks) {
      const updatedTask = createInstance(TaskModel, { ...task, selectedAt: null, updatedAt: new Date() });
      updateTaskMutation.mutate(updatedTask);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={resetAllSelected} className="text-yellow-500 hover:text-yellow-600">
      <RefreshCcw className="h-4 w-4 mr-1" />
      Reset All Selected Tasks
    </Button>
  );
}
