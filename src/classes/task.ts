import { isFutureDate } from '@/lib/utils';
import { Expose, Transform } from 'class-transformer';
import dayjs from 'dayjs';

export const ListsNames = ['Work', 'Personal'];

export class Task {
  @Expose()
  id!: string;

  @Expose({ name: 'field_2869962' })
  name!: string;

  @Expose({ name: 'field_2869964' })
  details!: string;

  @Expose({ name: 'field_2910918' })
  selected!: boolean;

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

  get isInFuture() {
    return isFutureDate(this.date);
  }

  get isActive() {
    return !this.isInFuture;
  }

  get isDeleted() {
    return !!this.deletedAt;
  }

  get isCompletedAgo() {
    return !!this.completedAt && dayjs(this.completedAt).isBefore(dayjs().subtract(1, 'day'));
  }
}

function transformDateToString({ value }: { value: Date | null }) {
  return value ? dayjs(value).format('YYYY-MM-DD') : null;
}
