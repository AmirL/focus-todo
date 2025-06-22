import { TaskModel } from '@/entities/task/model/task';

export function calculateTotalEstimatedTime(tasks: TaskModel[]): number {
  return tasks.reduce((total, task) => {
    if (task.estimatedDuration && !task.completedAt && !task.deletedAt) {
      return total + task.estimatedDuration;
    }
    return total;
  }, 0);
}
