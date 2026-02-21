import { describe, it, expect } from 'vitest';
import { GoalModel, type GoalPlain } from './goal';

describe('GoalModel', () => {
  const sampleGoalPlain: GoalPlain = {
    id: 'goal-1',
    title: 'Learn TypeScript',
    description: 'Master TypeScript fundamentals',
    progress: 50,
    listId: 1,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  };

  describe('toInstance', () => {
    it('should create a GoalModel instance from plain object', () => {
      const goal = GoalModel.toInstance(sampleGoalPlain);

      expect(goal).toBeInstanceOf(GoalModel);
      expect(goal.id).toBe('goal-1');
      expect(goal.title).toBe('Learn TypeScript');
      expect(goal.description).toBe('Master TypeScript fundamentals');
      expect(goal.progress).toBe(50);
      expect(goal.listId).toBe(1);
      expect(goal.deletedAt).toBeNull();
    });

    it('should handle null description', () => {
      const plain: GoalPlain = {
        ...sampleGoalPlain,
        description: null,
      };
      const goal = GoalModel.toInstance(plain);

      expect(goal).toBeInstanceOf(GoalModel);
      expect(goal.description).toBeNull();
    });

    it('should handle zero progress', () => {
      const plain: GoalPlain = {
        ...sampleGoalPlain,
        progress: 0,
      };
      const goal = GoalModel.toInstance(plain);

      expect(goal.progress).toBe(0);
    });

    it('should handle 100% progress', () => {
      const plain: GoalPlain = {
        ...sampleGoalPlain,
        progress: 100,
      };
      const goal = GoalModel.toInstance(plain);

      expect(goal.progress).toBe(100);
    });

    it('should handle deletedAt with a value', () => {
      const plain: GoalPlain = {
        ...sampleGoalPlain,
        deletedAt: '2024-02-01T00:00:00.000Z',
      };
      const goal = GoalModel.toInstance(plain);

      expect(goal.deletedAt).toBe('2024-02-01T00:00:00.000Z');
    });

    it('should handle different listId values', () => {
      const plain: GoalPlain = {
        ...sampleGoalPlain,
        listId: 2,
      };
      const goal = GoalModel.toInstance(plain);

      expect(goal.listId).toBe(2);
    });

    it('should handle plain object without optional fields', () => {
      const plain: GoalPlain = {
        id: 'goal-2',
        title: 'Minimal Goal',
        description: null,
        progress: 0,
        listId: 1,
        deletedAt: null,
      };
      const goal = GoalModel.toInstance(plain);

      expect(goal).toBeInstanceOf(GoalModel);
      expect(goal.id).toBe('goal-2');
      expect(goal.title).toBe('Minimal Goal');
    });
  });

  describe('fromPlainArray', () => {
    it('should convert an array of plain objects to GoalModel instances', () => {
      const plainGoals: GoalPlain[] = [
        sampleGoalPlain,
        {
          id: 'goal-2',
          title: 'Learn Rust',
          description: 'Systems programming',
          progress: 25,
          listId: 2,
          deletedAt: null,
        },
      ];

      const goals = GoalModel.fromPlainArray(plainGoals);

      expect(goals).toHaveLength(2);
      expect(goals[0]).toBeInstanceOf(GoalModel);
      expect(goals[1]).toBeInstanceOf(GoalModel);
      expect(goals[0].title).toBe('Learn TypeScript');
      expect(goals[1].title).toBe('Learn Rust');
    });

    it('should return an empty array when given an empty array', () => {
      const goals = GoalModel.fromPlainArray([]);

      expect(goals).toEqual([]);
      expect(goals).toHaveLength(0);
    });

    it('should convert a single-element array', () => {
      const goals = GoalModel.fromPlainArray([sampleGoalPlain]);

      expect(goals).toHaveLength(1);
      expect(goals[0]).toBeInstanceOf(GoalModel);
      expect(goals[0].id).toBe('goal-1');
    });

    it('should handle array with goals having different progress values', () => {
      const plainGoals: GoalPlain[] = [
        { ...sampleGoalPlain, id: 'g1', progress: 0 },
        { ...sampleGoalPlain, id: 'g2', progress: 50 },
        { ...sampleGoalPlain, id: 'g3', progress: 100 },
      ];

      const goals = GoalModel.fromPlainArray(plainGoals);

      expect(goals[0].progress).toBe(0);
      expect(goals[1].progress).toBe(50);
      expect(goals[2].progress).toBe(100);
    });

    it('should handle array with mix of deleted and active goals', () => {
      const plainGoals: GoalPlain[] = [
        { ...sampleGoalPlain, id: 'g1', deletedAt: null },
        { ...sampleGoalPlain, id: 'g2', deletedAt: '2024-02-01T00:00:00.000Z' },
        { ...sampleGoalPlain, id: 'g3', deletedAt: null },
      ];

      const goals = GoalModel.fromPlainArray(plainGoals);

      expect(goals[0].deletedAt).toBeNull();
      expect(goals[1].deletedAt).toBe('2024-02-01T00:00:00.000Z');
      expect(goals[2].deletedAt).toBeNull();
    });
  });

  describe('toPlain', () => {
    it('should convert a GoalModel instance back to a plain object', () => {
      const goal = GoalModel.toInstance(sampleGoalPlain);
      const plain = GoalModel.toPlain(goal);

      expect(plain).not.toBeInstanceOf(GoalModel);
      expect(plain.id).toBe('goal-1');
      expect(plain.title).toBe('Learn TypeScript');
      expect(plain.description).toBe('Master TypeScript fundamentals');
      expect(plain.progress).toBe(50);
      expect(plain.listId).toBe(1);
      expect(plain.deletedAt).toBeNull();
    });

    it('should produce a plain object that can be used to recreate the instance', () => {
      const goal = GoalModel.toInstance(sampleGoalPlain);
      const plain = GoalModel.toPlain(goal);
      const recreated = GoalModel.toInstance(plain);

      expect(recreated).toBeInstanceOf(GoalModel);
      expect(recreated.id).toBe(goal.id);
      expect(recreated.title).toBe(goal.title);
      expect(recreated.description).toBe(goal.description);
      expect(recreated.progress).toBe(goal.progress);
      expect(recreated.listId).toBe(goal.listId);
      expect(recreated.deletedAt).toBe(goal.deletedAt);
    });

    it('should handle converting a goal with null description', () => {
      const plain: GoalPlain = {
        ...sampleGoalPlain,
        description: null,
      };
      const goal = GoalModel.toInstance(plain);
      const result = GoalModel.toPlain(goal);

      expect(result.description).toBeNull();
    });

    it('should handle converting a deleted goal', () => {
      const plain: GoalPlain = {
        ...sampleGoalPlain,
        deletedAt: '2024-02-01T00:00:00.000Z',
      };
      const goal = GoalModel.toInstance(plain);
      const result = GoalModel.toPlain(goal);

      expect(result.deletedAt).toBe('2024-02-01T00:00:00.000Z');
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve all properties through toInstance -> toPlain -> toInstance', () => {
      const original = GoalModel.toInstance(sampleGoalPlain);
      const plain = GoalModel.toPlain(original);
      const restored = GoalModel.toInstance(plain);

      expect(restored.id).toBe(original.id);
      expect(restored.title).toBe(original.title);
      expect(restored.description).toBe(original.description);
      expect(restored.progress).toBe(original.progress);
      expect(restored.listId).toBe(original.listId);
      expect(restored.deletedAt).toBe(original.deletedAt);
    });

    it('should preserve array data through fromPlainArray -> toPlain for each', () => {
      const plainGoals: GoalPlain[] = [
        { ...sampleGoalPlain, id: 'g1', title: 'Goal 1', progress: 10 },
        { ...sampleGoalPlain, id: 'g2', title: 'Goal 2', progress: 90 },
      ];

      const models = GoalModel.fromPlainArray(plainGoals);
      const reserialized = models.map((m) => GoalModel.toPlain(m));

      expect(reserialized[0].id).toBe('g1');
      expect(reserialized[0].title).toBe('Goal 1');
      expect(reserialized[0].progress).toBe(10);
      expect(reserialized[1].id).toBe('g2');
      expect(reserialized[1].title).toBe('Goal 2');
      expect(reserialized[1].progress).toBe(90);
    });
  });
});
