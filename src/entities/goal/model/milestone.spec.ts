import { describe, it, expect } from 'vitest';
import { MilestoneModel, type MilestonePlain } from './milestone';

describe('MilestoneModel', () => {
  const sampleMilestonePlain: MilestonePlain = {
    id: 'milestone-1',
    goalId: 42,
    progress: 25,
    description: 'Completed first chapter',
    createdAt: '2024-01-15T10:30:00.000Z',
  };

  describe('toInstance', () => {
    it('should create a MilestoneModel instance from plain object', () => {
      const milestone = MilestoneModel.toInstance(sampleMilestonePlain);

      expect(milestone).toBeInstanceOf(MilestoneModel);
      expect(milestone.id).toBe('milestone-1');
      expect(milestone.goalId).toBe(42);
      expect(milestone.progress).toBe(25);
      expect(milestone.description).toBe('Completed first chapter');
      expect(milestone.createdAt).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should handle zero progress', () => {
      const plain: MilestonePlain = {
        ...sampleMilestonePlain,
        progress: 0,
      };
      const milestone = MilestoneModel.toInstance(plain);

      expect(milestone.progress).toBe(0);
    });

    it('should handle 100% progress', () => {
      const plain: MilestonePlain = {
        ...sampleMilestonePlain,
        progress: 100,
      };
      const milestone = MilestoneModel.toInstance(plain);

      expect(milestone.progress).toBe(100);
    });

    it('should handle empty description', () => {
      const plain: MilestonePlain = {
        ...sampleMilestonePlain,
        description: '',
      };
      const milestone = MilestoneModel.toInstance(plain);

      expect(milestone.description).toBe('');
    });

    it('should handle different goalId values', () => {
      const plain: MilestonePlain = {
        ...sampleMilestonePlain,
        goalId: 999,
      };
      const milestone = MilestoneModel.toInstance(plain);

      expect(milestone.goalId).toBe(999);
    });

    it('should preserve createdAt timestamp exactly', () => {
      const timestamp = '2024-06-15T23:59:59.999Z';
      const plain: MilestonePlain = {
        ...sampleMilestonePlain,
        createdAt: timestamp,
      };
      const milestone = MilestoneModel.toInstance(plain);

      expect(milestone.createdAt).toBe(timestamp);
    });
  });

  describe('fromPlainArray', () => {
    it('should convert an array of plain objects to MilestoneModel instances', () => {
      const plainMilestones: MilestonePlain[] = [
        sampleMilestonePlain,
        {
          id: 'milestone-2',
          goalId: 42,
          progress: 50,
          description: 'Completed second chapter',
          createdAt: '2024-02-01T12:00:00.000Z',
        },
        {
          id: 'milestone-3',
          goalId: 42,
          progress: 75,
          description: 'Completed third chapter',
          createdAt: '2024-02-15T08:00:00.000Z',
        },
      ];

      const milestones = MilestoneModel.fromPlainArray(plainMilestones);

      expect(milestones).toHaveLength(3);
      expect(milestones[0]).toBeInstanceOf(MilestoneModel);
      expect(milestones[1]).toBeInstanceOf(MilestoneModel);
      expect(milestones[2]).toBeInstanceOf(MilestoneModel);
      expect(milestones[0].progress).toBe(25);
      expect(milestones[1].progress).toBe(50);
      expect(milestones[2].progress).toBe(75);
    });

    it('should return an empty array when given an empty array', () => {
      const milestones = MilestoneModel.fromPlainArray([]);

      expect(milestones).toEqual([]);
      expect(milestones).toHaveLength(0);
    });

    it('should convert a single-element array', () => {
      const milestones = MilestoneModel.fromPlainArray([sampleMilestonePlain]);

      expect(milestones).toHaveLength(1);
      expect(milestones[0]).toBeInstanceOf(MilestoneModel);
      expect(milestones[0].id).toBe('milestone-1');
    });

    it('should handle milestones from different goals', () => {
      const plainMilestones: MilestonePlain[] = [
        { ...sampleMilestonePlain, id: 'm1', goalId: 1 },
        { ...sampleMilestonePlain, id: 'm2', goalId: 2 },
        { ...sampleMilestonePlain, id: 'm3', goalId: 1 },
      ];

      const milestones = MilestoneModel.fromPlainArray(plainMilestones);

      expect(milestones[0].goalId).toBe(1);
      expect(milestones[1].goalId).toBe(2);
      expect(milestones[2].goalId).toBe(1);
    });

    it('should maintain order of input array', () => {
      const plainMilestones: MilestonePlain[] = [
        { ...sampleMilestonePlain, id: 'm3', progress: 75 },
        { ...sampleMilestonePlain, id: 'm1', progress: 25 },
        { ...sampleMilestonePlain, id: 'm2', progress: 50 },
      ];

      const milestones = MilestoneModel.fromPlainArray(plainMilestones);

      expect(milestones[0].id).toBe('m3');
      expect(milestones[1].id).toBe('m1');
      expect(milestones[2].id).toBe('m2');
    });
  });

  describe('toPlain', () => {
    it('should convert a MilestoneModel instance back to a plain object', () => {
      const milestone = MilestoneModel.toInstance(sampleMilestonePlain);
      const plain = MilestoneModel.toPlain(milestone);

      expect(plain).not.toBeInstanceOf(MilestoneModel);
      expect(plain.id).toBe('milestone-1');
      expect(plain.goalId).toBe(42);
      expect(plain.progress).toBe(25);
      expect(plain.description).toBe('Completed first chapter');
      expect(plain.createdAt).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should produce a plain object that can be used to recreate the instance', () => {
      const milestone = MilestoneModel.toInstance(sampleMilestonePlain);
      const plain = MilestoneModel.toPlain(milestone);
      const recreated = MilestoneModel.toInstance(plain);

      expect(recreated).toBeInstanceOf(MilestoneModel);
      expect(recreated.id).toBe(milestone.id);
      expect(recreated.goalId).toBe(milestone.goalId);
      expect(recreated.progress).toBe(milestone.progress);
      expect(recreated.description).toBe(milestone.description);
      expect(recreated.createdAt).toBe(milestone.createdAt);
    });

    it('should handle converting a milestone with empty description', () => {
      const plain: MilestonePlain = {
        ...sampleMilestonePlain,
        description: '',
      };
      const milestone = MilestoneModel.toInstance(plain);
      const result = MilestoneModel.toPlain(milestone);

      expect(result.description).toBe('');
    });

    it('should handle converting a milestone with zero progress', () => {
      const plain: MilestonePlain = {
        ...sampleMilestonePlain,
        progress: 0,
      };
      const milestone = MilestoneModel.toInstance(plain);
      const result = MilestoneModel.toPlain(milestone);

      expect(result.progress).toBe(0);
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve all properties through toInstance -> toPlain -> toInstance', () => {
      const original = MilestoneModel.toInstance(sampleMilestonePlain);
      const plain = MilestoneModel.toPlain(original);
      const restored = MilestoneModel.toInstance(plain);

      expect(restored.id).toBe(original.id);
      expect(restored.goalId).toBe(original.goalId);
      expect(restored.progress).toBe(original.progress);
      expect(restored.description).toBe(original.description);
      expect(restored.createdAt).toBe(original.createdAt);
    });

    it('should preserve array data through fromPlainArray -> toPlain for each', () => {
      const plainMilestones: MilestonePlain[] = [
        { ...sampleMilestonePlain, id: 'm1', progress: 10, description: 'Step 1' },
        { ...sampleMilestonePlain, id: 'm2', progress: 50, description: 'Step 2' },
        { ...sampleMilestonePlain, id: 'm3', progress: 100, description: 'Done' },
      ];

      const models = MilestoneModel.fromPlainArray(plainMilestones);
      const reserialized = models.map((m) => MilestoneModel.toPlain(m));

      expect(reserialized[0].id).toBe('m1');
      expect(reserialized[0].progress).toBe(10);
      expect(reserialized[0].description).toBe('Step 1');
      expect(reserialized[1].id).toBe('m2');
      expect(reserialized[1].progress).toBe(50);
      expect(reserialized[1].description).toBe('Step 2');
      expect(reserialized[2].id).toBe('m3');
      expect(reserialized[2].progress).toBe(100);
      expect(reserialized[2].description).toBe('Done');
    });
  });
});
