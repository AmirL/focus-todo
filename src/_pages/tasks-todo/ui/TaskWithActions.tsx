import { Task } from '@/entities/task/ui/Task';
import { EditTaskButton } from '@/features/tasks/edit/ui/EditTaskButton';
import { DeleteButton } from '@/features/tasks/actions/ui/DeleteButton';
import { ReAddButton } from '@/features/tasks/actions/ui/ReAddButton';
import { SnoozeButton } from '@/features/tasks/actions/ui/SnoozeButton';
import { StarButton } from '@/features/tasks/actions/ui/StarButton';
import { BlockerButton } from '@/features/tasks/actions/ui/BlockerButton';
import { EstimatedTimeButton } from '@/features/tasks/actions/ui/EstimatedTimeButton';
import { useReorderStore } from '@/features/tasks/reorder';
import { useTempSelectStore } from '@/features/tasks/temp-select';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { isTaskDeleted, type TaskModel } from '@/entities/task/model/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function TaskWithActions({ task }: { task: TaskModel }) {
  const { isDragging } = useReorderStore();
  const { toggleSelection, isSelected: isTempSelected } = useTempSelectStore();
  const statusFilter = useFilterStore((s) => s.statusFilter);
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
    <div ref={setNodeRef} style={style} {...attributes}>
      <Task
        task={task}
        isDragging={isCurrentTaskDragging}
        estimatedTimeSlot={<EstimatedTimeButton task={task} />}
        isTempSelected={isTempSelected(task.id)}
        onToggleSelection={
          statusFilter === StatusFilterEnum.SELECTED && !isTaskDeleted(task)
            ? () => toggleSelection(task.id)
            : undefined
        }
        hideTodayBadge={statusFilter === StatusFilterEnum.TODAY}
        hideDateBadge={statusFilter === StatusFilterEnum.TOMORROW}
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

