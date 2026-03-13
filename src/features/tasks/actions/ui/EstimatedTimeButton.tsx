import { TaskModel } from '@/entities/task/model/task';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';
import { formatDuration } from '@/shared/lib/format-duration';
import { DURATION_OPTIONS } from '@/shared/lib/duration-options';


interface EstimatedTimeButtonProps {
  task: TaskModel;
}

export function EstimatedTimeButton({ task }: EstimatedTimeButtonProps) {
  const updateTaskMutation = useUpdateTaskMutation();

  const handleDurationChange = (minutes: number | null) => {
    const updatedTask = createInstance(TaskModel, { ...task, estimatedDuration: minutes, updatedAt: new Date() });
    updateTaskMutation.mutate(updatedTask);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded bg-white cursor-pointer ${
            task.estimatedDuration ? 'text-inherit' : 'text-gray-400'
          }`}
          data-cy={`estimated-time-task-${task.id}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {task.estimatedDuration ? formatDuration(task.estimatedDuration) : 'Set time'}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[160px] p-2 bg-white border border-gray-300 rounded shadow-lg z-[9999]"
          sideOffset={5}
          align="end"
        >
          <div className="px-2 py-1 text-xs font-bold text-gray-500">
            Estimated Duration
          </div>
          <div className="h-px bg-gray-200 my-1"></div>

          <DropdownMenu.Item
            className="p-2 text-sm cursor-pointer rounded-sm"
            onSelect={() => handleDurationChange(null)}
          >
            None
          </DropdownMenu.Item>

          {DURATION_OPTIONS.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              className="p-2 text-sm cursor-pointer rounded-sm"
              onSelect={() => handleDurationChange(option.value)}
            >
              {option.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
