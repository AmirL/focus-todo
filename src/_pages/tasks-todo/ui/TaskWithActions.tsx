import { Task } from '@/entities/task/ui/Task';
import { EditTaskButton } from '@/features/tasks/edit/ui/EditTaskButton';
import { DeleteButton } from '@/features/tasks/actions/ui/DeleteButton';
import { ReAddButton } from '@/features/tasks/actions/ui/ReAddButton';
import { SnoozeButton } from '@/features/tasks/actions/ui/SnoozeButton';
import { StarButton } from '@/features/tasks/actions/ui/StarButton';
import { BlockerButton } from '@/features/tasks/actions/ui/BlockerButton';
import type { TaskModel } from '@/entities/task/model/task';

export function TaskWithActions({ task }: { task: TaskModel }) {
  return (
    <Task
      key={task.id}
      task={task}
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
  );
}

