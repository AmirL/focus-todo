import { instanceToPlain, plainToInstance } from 'class-transformer';

export type GoalPlain = {
  id: string;
  title: string;
  progress: number;
  list: string;
  deletedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export class GoalModel {
  id!: string;
  title!: string;
  progress!: number;
  list!: string;
  deletedAt!: string;

  static toInstance(data: GoalPlain): GoalModel {
    return plainToInstance(GoalModel, data);
  }

  static fromPlainArray(data: GoalPlain[]): GoalModel[] {
    return data.map((task) => this.toInstance(task));
  }

  static toPlain(task: GoalModel): GoalPlain {
    return instanceToPlain(task) as GoalPlain;
  }
}
