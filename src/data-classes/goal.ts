import { instanceToPlain, plainToInstance } from 'class-transformer';

export type GoalPlain = {
  id: string;
  title: string;
  progress: number;
  list: string;
  deletedAt: string;
};

export class Goal {
  id!: string;
  title!: string;
  progress!: number;
  list!: string;
  deletedAt!: string;

  static toInstance(data: GoalPlain): Goal {
    return plainToInstance(Goal, data);
  }

  static fromPlainArray(data: GoalPlain[]): Goal[] {
    return data.map((task) => this.toInstance(task));
  }

  static toPlain(task: Goal): GoalPlain {
    return instanceToPlain(task) as GoalPlain;
  }
}
