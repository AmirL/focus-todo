import { Task } from '@/entities/task/ui/Task';
import { EditTaskButton } from '@/features/tasks/edit/ui/EditTaskButton';
import { DeleteButton } from '@/features/tasks/actions/ui/DeleteButton';
import { ReAddButton } from '@/features/tasks/actions/ui/ReAddButton';
import { SnoozeButton } from '@/features/tasks/actions/ui/SnoozeButton';
import { StarButton } from '@/features/tasks/actions/ui/StarButton';
import { BlockerButton } from '@/features/tasks/actions/ui/BlockerButton';
import { useReorderStore } from '@/features/tasks/reorder';
import type { TaskModel } from '@/entities/task/model/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function TaskWithActions({ task }: { task: TaskModel }) {
  const { isDragging } = useReorderStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentTaskDragging,
    setActivatorNodeRef,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} data-task-id={task.id} {...attributes}>
      <Task
        task={task}
        isDragging={isCurrentTaskDragging}
        dragHandle={
          <button
            ref={setActivatorNodeRef}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...listeners}
            aria-label="Drag to reorder task"
          >
            <GripVertical size={16} />
          </button>
        }
        actionButtons={
          <>
            <EditTaskButton key="edit" task={task} />
            <BlockerButton task={task} />
            <StarButton task={task} />
            <SnoozeButton task={task} />
            <ReAddButton task={task} />
            <DeleteButton task={task} />
          </>
        }
      />
    </div>
  );
}

