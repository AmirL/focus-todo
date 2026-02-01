import { describe, it, expect } from 'vitest';
import {
  getSuggestedList,
  calculateBalance,
  CurrentInitiativeModel,
  type ListWithLastTouched,
} from './current-initiative';

describe('getSuggestedList', () => {
  it('should return null when no lists provided', () => {
    const result = getSuggestedList([]);
    expect(result).toBeNull();
  });

  it('should return null when no lists participate in initiative', () => {
    const lists: ListWithLastTouched[] = [
      { id: 1, name: 'Work', participatesInInitiative: false, lastTouchedAt: null },
      { id: 2, name: 'Personal', participatesInInitiative: false, lastTouchedAt: null },
    ];
    const result = getSuggestedList(lists);
    expect(result).toBeNull();
  });

  it('should prioritize lists that have never been touched', () => {
    const lists: ListWithLastTouched[] = [
      { id: 1, name: 'Work', participatesInInitiative: true, lastTouchedAt: new Date('2024-01-15') },
      { id: 2, name: 'Personal', participatesInInitiative: true, lastTouchedAt: null },
      { id: 3, name: 'Side Project', participatesInInitiative: true, lastTouchedAt: new Date('2024-01-10') },
    ];
    const result = getSuggestedList(lists);
    expect(result?.id).toBe(2);
    expect(result?.name).toBe('Personal');
  });

  it('should suggest list touched longest ago when all have been touched', () => {
    const lists: ListWithLastTouched[] = [
      { id: 1, name: 'Work', participatesInInitiative: true, lastTouchedAt: new Date('2024-01-15') },
      { id: 2, name: 'Personal', participatesInInitiative: true, lastTouchedAt: new Date('2024-01-10') },
      { id: 3, name: 'Side Project', participatesInInitiative: true, lastTouchedAt: new Date('2024-01-12') },
    ];
    const result = getSuggestedList(lists);
    expect(result?.id).toBe(2);
    expect(result?.name).toBe('Personal');
  });

  it('should only consider lists that participate in initiative', () => {
    const lists: ListWithLastTouched[] = [
      { id: 1, name: 'Work', participatesInInitiative: true, lastTouchedAt: new Date('2024-01-15') },
      { id: 2, name: 'Personal', participatesInInitiative: false, lastTouchedAt: null }, // Should be ignored
      { id: 3, name: 'Side Project', participatesInInitiative: true, lastTouchedAt: new Date('2024-01-10') },
    ];
    const result = getSuggestedList(lists);
    expect(result?.id).toBe(3); // Oldest touched participating list
    expect(result?.name).toBe('Side Project');
  });

  it('should return first list by ID when multiple never-touched lists exist', () => {
    const lists: ListWithLastTouched[] = [
      { id: 3, name: 'Side Project', participatesInInitiative: true, lastTouchedAt: null },
      { id: 1, name: 'Work', participatesInInitiative: true, lastTouchedAt: null },
      { id: 2, name: 'Personal', participatesInInitiative: true, lastTouchedAt: null },
    ];
    const result = getSuggestedList(lists);
    expect(result?.id).toBe(1); // Lowest ID among never-touched
  });
});

describe('calculateBalance', () => {
  it('should return empty array when no lists provided', () => {
    const result = calculateBalance([], []);
    expect(result).toEqual([]);
  });

  it('should initialize all lists with 0 count when no initiatives', () => {
    const lists = [
      { id: 1, name: 'Work' },
      { id: 2, name: 'Personal' },
    ];
    const result = calculateBalance([], lists);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ listId: 1, listName: 'Work', count: 0, lastUsedDate: null });
    expect(result[1]).toEqual({ listId: 2, listName: 'Personal', count: 0, lastUsedDate: null });
  });

  it('should count initiatives by effective list (chosen or suggested)', () => {
    const initiatives = [
      createMockInitiative({ date: '2024-01-15', suggestedListId: 1, chosenListId: null }),
      createMockInitiative({ date: '2024-01-14', suggestedListId: 2, chosenListId: null }),
      createMockInitiative({ date: '2024-01-13', suggestedListId: 1, chosenListId: 2 }), // Changed to 2
    ];
    const lists = [
      { id: 1, name: 'Work' },
      { id: 2, name: 'Personal' },
    ];
    const result = calculateBalance(initiatives, lists);

    const workBalance = result.find((b) => b.listId === 1);
    const personalBalance = result.find((b) => b.listId === 2);

    expect(workBalance?.count).toBe(1); // Only 2024-01-15
    expect(personalBalance?.count).toBe(2); // 2024-01-14 and 2024-01-13 (changed)
  });

  it('should track lastUsedDate correctly', () => {
    const initiatives = [
      createMockInitiative({ date: '2024-01-15', suggestedListId: 1, chosenListId: null }),
      createMockInitiative({ date: '2024-01-10', suggestedListId: 1, chosenListId: null }),
      createMockInitiative({ date: '2024-01-12', suggestedListId: 2, chosenListId: null }),
    ];
    const lists = [
      { id: 1, name: 'Work' },
      { id: 2, name: 'Personal' },
    ];
    const result = calculateBalance(initiatives, lists);

    const workBalance = result.find((b) => b.listId === 1);
    const personalBalance = result.find((b) => b.listId === 2);

    expect(workBalance?.lastUsedDate).toBe('2024-01-15'); // Most recent
    expect(personalBalance?.lastUsedDate).toBe('2024-01-12');
  });

  it('should ignore initiatives for lists not in the provided list', () => {
    const initiatives = [
      createMockInitiative({ date: '2024-01-15', suggestedListId: 1, chosenListId: null }),
      createMockInitiative({ date: '2024-01-14', suggestedListId: 99, chosenListId: null }), // Unknown list
    ];
    const lists = [
      { id: 1, name: 'Work' },
    ];
    const result = calculateBalance(initiatives, lists);

    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(1);
  });
});

describe('CurrentInitiativeModel', () => {
  describe('getEffectiveListId', () => {
    it('should return chosenListId when set', () => {
      const model = CurrentInitiativeModel.toInstance({
        id: 1,
        userId: 'user-1',
        date: '2024-01-15',
        suggestedListId: 1,
        chosenListId: 2,
        reason: null,
        setAt: '2024-01-14 10:00:00',
        changedAt: null,
      });
      expect(model.getEffectiveListId()).toBe(2);
    });

    it('should return suggestedListId when chosenListId is null', () => {
      const model = CurrentInitiativeModel.toInstance({
        id: 1,
        userId: 'user-1',
        date: '2024-01-15',
        suggestedListId: 1,
        chosenListId: null,
        reason: null,
        setAt: '2024-01-14 10:00:00',
        changedAt: null,
      });
      expect(model.getEffectiveListId()).toBe(1);
    });
  });

  describe('wasChanged', () => {
    it('should return true when user chose a different list', () => {
      const model = CurrentInitiativeModel.toInstance({
        id: 1,
        userId: 'user-1',
        date: '2024-01-15',
        suggestedListId: 1,
        chosenListId: 2,
        reason: 'Had a deadline',
        setAt: '2024-01-14 10:00:00',
        changedAt: '2024-01-14 11:00:00',
      });
      expect(model.wasChanged()).toBe(true);
    });

    it('should return false when chosenListId is null (accepted suggestion)', () => {
      const model = CurrentInitiativeModel.toInstance({
        id: 1,
        userId: 'user-1',
        date: '2024-01-15',
        suggestedListId: 1,
        chosenListId: null,
        reason: null,
        setAt: '2024-01-14 10:00:00',
        changedAt: null,
      });
      expect(model.wasChanged()).toBe(false);
    });

    it('should return false when chosenListId equals suggestedListId', () => {
      const model = CurrentInitiativeModel.toInstance({
        id: 1,
        userId: 'user-1',
        date: '2024-01-15',
        suggestedListId: 1,
        chosenListId: 1,
        reason: null,
        setAt: '2024-01-14 10:00:00',
        changedAt: null,
      });
      expect(model.wasChanged()).toBe(false);
    });
  });
});

// Helper function to create mock initiative objects for testing
function createMockInitiative(overrides: {
  date: string;
  suggestedListId: number | null;
  chosenListId: number | null;
}) {
  return {
    id: Math.random(),
    userId: 'user-1',
    date: overrides.date,
    suggestedListId: overrides.suggestedListId,
    chosenListId: overrides.chosenListId,
    reason: null,
    setAt: new Date(),
    changedAt: null,
    getEffectiveListId: () => overrides.chosenListId ?? overrides.suggestedListId,
    wasChanged: () =>
      overrides.chosenListId !== null &&
      overrides.chosenListId !== overrides.suggestedListId,
  };
}
