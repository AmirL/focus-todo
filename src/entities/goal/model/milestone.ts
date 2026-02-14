import { instanceToPlain, plainToInstance } from 'class-transformer';

export type MilestonePlain = {
  id: string;
  goalId: number;
  progress: number;
  description: string;
  createdAt: string;
};

export class MilestoneModel {
  id!: string;
  goalId!: number;
  progress!: number;
  description!: string;
  createdAt!: string;

  static toInstance(data: MilestonePlain): MilestoneModel {
    return plainToInstance(MilestoneModel, data);
  }

  static fromPlainArray(data: MilestonePlain[]): MilestoneModel[] {
    return data.map((m) => this.toInstance(m));
  }

  static toPlain(milestone: MilestoneModel): MilestonePlain {
    return instanceToPlain(milestone) as MilestonePlain;
  }
}
