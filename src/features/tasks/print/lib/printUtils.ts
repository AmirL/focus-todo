import { TaskModel } from '@/entities/task/model/task';
import dayjs from 'dayjs';

export interface GroupedTasks {
  [listType: string]: TaskModel[];
}

export function filterPrintableTasks(tasks: TaskModel[]): TaskModel[] {
  return tasks.filter(task => !task.completedAt && !task.deletedAt);
}

export function groupTasksByList(tasks: TaskModel[]): GroupedTasks {
  return tasks.reduce((acc: GroupedTasks, task) => {
    if (!acc[task.list]) {
      acc[task.list] = [];
    }
    acc[task.list].push(task);
    return acc;
  }, {});
}

export function sortTasksByDuration(groupedTasks: GroupedTasks): void {
  Object.keys(groupedTasks).forEach(listType => {
    groupedTasks[listType].sort((a, b) => {
      const aDuration = a.estimatedDuration || 0;
      const bDuration = b.estimatedDuration || 0;
      return bDuration - aDuration;
    });
  });
}

export function formatDate(date: Date | null): string {
  if (!date) return dayjs().format('DD/MM/YYYY');
  return dayjs(date).format('DD/MM/YYYY');
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return '0m';
  if (minutes >= 60) {
    const hours = minutes / 60;
    return `${hours}h`;
  }
  return `${minutes}m`;
}

export function calculateTotalDuration(tasks: TaskModel[]): number {
  return tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);
}