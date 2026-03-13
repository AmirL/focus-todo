import { TaskModel } from '@/entities/task/model/task';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';
import { formatDuration } from '@/shared/lib/format-duration';

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '1 day' },
];


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
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            color: task.estimatedDuration ? 'inherit' : '#999',
          }}
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
            style={{ marginRight: '4px' }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {task.estimatedDuration ? formatDuration(task.estimatedDuration) : 'Set time'}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          style={{
            minWidth: '160px',
            padding: '8px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
          }}
          sideOffset={5}
          align="end"
        >
          <div style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
            Estimated Duration
          </div>
          <div style={{ height: '1px', backgroundColor: '#eee', margin: '4px 0' }}></div>

          <DropdownMenu.Item
            style={{
              padding: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '2px',
            }}
            onSelect={() => handleDurationChange(null)}
          >
            None
          </DropdownMenu.Item>

          {DURATION_OPTIONS.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              style={{
                padding: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
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
