import { instanceToPlain, plainToInstance } from 'class-transformer';

export type GoalPlain = {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  listId: number;
  deletedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export class GoalModel {
  id!: string;
  title!: string;
  description!: string;
  progress!: number;
  listId!: number;
  deletedAt!: string;
  createdAt!: string;

  static toInstance(data: GoalPlain): GoalModel {
    return plainToInstance(GoalModel, data);
  }

  static fromPlainArray(data: GoalPlain[]): GoalModel[] {
    return data.map((goal) => this.toInstance(goal));
  }

  static toPlain(goal: GoalModel): GoalPlain {
    return instanceToPlain(goal) as GoalPlain;
  }
}
