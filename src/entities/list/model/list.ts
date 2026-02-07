import { instanceToPlain, plainToInstance, Transform } from 'class-transformer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export type ListPlain = {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  isDefault: boolean;
  participatesInInitiative: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
};

export class ListModel {
  id!: string;
  name!: string;
  description?: string | null;
  userId!: string;
  isDefault!: boolean;
  participatesInInitiative!: boolean;
  sortOrder!: number;

  @Transform(transformDateToUTCString, { toPlainOnly: true })
  createdAt!: Date;

  @Transform(transformDateToUTCString, { toPlainOnly: true })
  updatedAt?: Date | null;

  static toInstance(data: ListPlain): ListModel {
    return plainToInstance(ListModel, data);
  }

  static fromPlainArray(data: ListPlain[]): ListModel[] {
    return data.map((list) => this.toInstance(list));
  }

  static toPlain(list: ListModel): ListPlain {
    return instanceToPlain(list) as ListPlain;
  }
}

function transformDateToUTCString({ value }: { value: Date | null }) {
  if (!value) return null;
  return dayjs(value).utc().format('YYYY-MM-DD HH:mm:ss');
}