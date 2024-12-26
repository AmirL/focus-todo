import { isFutureDate } from '@/lib/utils';
import { Expose, instanceToPlain, plainToInstance, Transform } from 'class-transformer';
import dayjs from 'dayjs';

export const ListsNames = ['Work', 'Personal'];

export type TaskPlain = {
  id: string;
  field_2869962: string;
  field_2869964: string;
  field_2910918: boolean;
  field_2869965: string | null;
  field_2872650: string | null;
  field_2872651: string;
  field_3017209: string | null;
};

export class Task {
  @Expose()
  id!: string;

  @Expose({ name: 'field_2869962' })
  name!: string;

  @Expose({ name: 'field_2869964' })
  details!: string;

  @Expose({ name: 'field_2910918' })
  starred!: boolean;

  @Expose({ name: 'field_2869965' })
  @Transform(transformDateToString, { toPlainOnly: true })
  date?: Date | null;

  @Expose({ name: 'field_2872650' })
  @Transform(transformDateToString, { toPlainOnly: true })
  completedAt?: Date | null;

  @Expose({ name: 'field_2872651' })
  list!: string;

  @Expose({ name: 'field_3017209' })
  @Transform(transformDateToString, { toPlainOnly: true })
  deletedAt?: Date | null;

  static clone(task: Task): Task {
    return Object.assign(new Task(), task);
  }

  static create(task: Partial<Task>): Task {
    return Object.assign(new Task(), task);
  }

  static toInstance(data: TaskPlain): Task {
    return plainToInstance(Task, data);
  }

  static toInstanceArray(data: TaskPlain[]): Task[] {
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

function transformDateToString({ value }: { value: Date | null }) {
  return value ? dayjs(value).format('YYYY-MM-DD') : null;
}
