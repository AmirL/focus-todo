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
};

export class Task {
  id!: string;

  name!: string;

  details!: string;

  @Transform(transformDateToString, { toPlainOnly: true })
  selectedAt?: Date | null;

  @Transform(transformDateToString, { toPlainOnly: true })
  date?: Date | null;

  @Transform(transformDateToString, { toPlainOnly: true })
  completedAt?: Date | null;

  list!: string;

  @Transform(transformDateToString, { toPlainOnly: true })
  deletedAt?: Date | null;

  @Transform(transformDateToUTCString, { toPlainOnly: true })
  updatedAt!: Date;

  static toInstance(data: TaskPlain): Task {
    return plainToInstance(Task, data);
  }

  static fromPlainArray(data: TaskPlain[]): Task[] {
    return data.map((task) => this.toInstance(task));
  }

  static toPlain(task: Task): TaskPlain {
    return instanceToPlain(task) as TaskPlain;
  }
}

export function isTaskInFuture(task: Task) {
  return isFutureDate(task.date);
}

export function isTaskActive(task: Task) {
  return !isTaskInFuture(task);
}

export function isTaskDeleted(task: Task) {
  return !!task.deletedAt;
}

export function isTaskCompletedAgo(task: Task) {
  return !!task.completedAt && dayjs(task.completedAt).isBefore(dayjs().subtract(1, 'day'));
}

export function isTaskSelected(task: Task) {
  return !!task.selectedAt && dayjs(task.selectedAt).isSame(dayjs(), 'day');
}

function transformDateToString({ value }: { value: Date | null }) {
  if (!value) return null;
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
}

function transformDateToUTCString({ value }: { value: Date | null }) {
  if (!value) return null;
  return dayjs(value).utc().format('YYYY-MM-DD HH:mm:ss');
}
