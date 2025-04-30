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
  selectedAt: string;
  date: string;
  completedAt: string;
  list: string;
  deletedAt: string;
  createdAt: string;
};

export class TaskModel {
  id!: string;

  name!: string;

  details!: string;

  @Transform(transformDateToString, { toPlainOnly: true })
  selectedAt?: Date | null;

  @Transform(transformDateToString, { toPlainOnly: true })
  date?: Date | null;

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
  return !isTaskInFuture(task) && !isTaskSelected(task);
}

export function isTaskDeleted(task: TaskModel) {
  return !!task.deletedAt;
}

export function isTaskCompletedAgo(task: TaskModel) {
  return !!task.completedAt && dayjs(task.completedAt).isBefore(dayjs().subtract(1, 'day'));
}

export function isTaskSelected(task: TaskModel) {
  return !!task.selectedAt; // && dayjs(task.selectedAt).isSame(dayjs(), 'day');
}

function transformDateToString({ value }: { value: Date | null }) {
  if (!value) return null;
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
}

function transformDateToUTCString({ value }: { value: Date | null }) {
  if (!value) return null;
  return dayjs(value).utc().format('YYYY-MM-DD HH:mm:ss');
}
