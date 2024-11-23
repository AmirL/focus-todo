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
  @Transform(({ value }) => (value ? dayjs(value).format('YYYY-MM-DD') : null), { toPlainOnly: true })
  date?: string | null;

  @Expose({ name: 'field_2872650' })
  @Transform(({ value }) => (value ? dayjs(value).format('YYYY-MM-DD') : null), { toPlainOnly: true })
  completedAt?: string | null;

  @Expose({ name: 'field_2872651' })
  list!: string;
}
