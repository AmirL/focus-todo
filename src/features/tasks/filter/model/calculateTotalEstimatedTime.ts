import { TaskModel } from '@/entities/task/model/task';

export function calculateTotalEstimatedTime(tasks: TaskModel[]): number {
  return tasks.reduce((total, task) => {
    if (task.estimatedDuration && !task.completedAt && !task.deletedAt) {
      return total + task.estimatedDuration;
    }
    return total;
  }, 0);
}

export function formatTotalDuration(minutes: number): string {
  if (minutes === 0) return '';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}
