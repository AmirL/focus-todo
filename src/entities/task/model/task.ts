import { isFutureDate } from '@/shared/lib/utils';
import { instanceToPlain, plainToInstance, Transform } from 'class-transformer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export const ListsNames = ['Work', 'Personal'];

export type TaskPlain = {
  id: string;
  name: string;
  details: string;
  selectedAt: string | null;
  date: string | null;
  completedAt: string | null;
  list: string;
  deletedAt: string | null;
  createdAt: string;
  estimatedDuration?: number | null;
  isBlocker?: boolean;
  updatedAt?: string;
};

export class TaskModel {
  id!: string;

  name!: string;

  details!: string;

  @Transform(transformDateToString, { toPlainOnly: true })
  selectedAt?: Date | null;

  @Transform(transformDateToString, { toPlainOnly: true })
  date?: Date | null;

  estimatedDuration!: number | null;

  @Transform(transformDateToString, { toPlainOnly: true })
  completedAt?: Date | null;

  isBlocker: boolean = false;

  list!: string;

  @Transform(transformDateToString, { toPlainOnly: true })
  deletedAt?: Date | null;

  @Transform(transformDateToUTCString, { toPlainOnly: true })
  updatedAt!: Date;

  @Transform(transformDateToUTCString, { toPlainOnly: true })
  createdAt!: Date;

  static toInstance(data: TaskPlain): TaskModel {
    return plainToInstance(TaskModel, data);
  }

  static fromPlainArray(data: TaskPlain[]): TaskModel[] {
    return data.map((task) => this.toInstance(task));
  }

  static toPlain(task: TaskModel): TaskPlain {
    return instanceToPlain(task) as TaskPlain;
  }
}

export function isTaskInFuture(task: TaskModel) {
  return isFutureDate(task.date);
}

export function isTaskInBacklog(task: TaskModel) {
  return !task.date && !task.selectedAt;
}

export function isTaskDeleted(task: TaskModel) {
  return !!task.deletedAt;
}

export function isTaskDeletedAgo(task: TaskModel) {
  return !!task.deletedAt && dayjs(task.deletedAt).isBefore(dayjs().subtract(1, 'day'));
}

export function isTaskCompletedAgo(task: TaskModel) {
  return !!task.completedAt && dayjs(task.completedAt).isBefore(dayjs().subtract(1, 'day'));
}

export function isTaskSelected(task: TaskModel) {
  return !!task.selectedAt; // && dayjs(task.selectedAt).isSame(dayjs(), 'day');
}

export function isTaskToday(task: TaskModel) {
  return task.date && dayjs(task.date).isSame(dayjs(), 'day');
}

export function isTaskTomorrow(task: TaskModel) {
  return task.date && dayjs(task.date).isSame(dayjs().add(1, 'day'), 'day');
}

export function isTaskOverdue(task: TaskModel) {
  return task.date && dayjs(task.date).isBefore(dayjs(), 'day') && !task.completedAt;
}

function transformDateToString({ value }: { value: Date | null }) {
  if (!value) return null;
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
}

function transformDateToUTCString({ value }: { value: Date | null }) {
  if (!value) return null;
  return dayjs(value).utc().format('YYYY-MM-DD HH:mm:ss');
}
