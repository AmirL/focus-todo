import { describe, it, expect } from 'vitest';
import { serializeInitiative, serializeInitiativeWithLists } from './serialize';

describe('serializeInitiative', () => {
  it('should serialize an initiative row with dates as ISO strings', () => {
    const row = {
      id: 1,
      userId: 'user-1',
      date: new Date('2026-02-15'),
      suggestedListId: 1,
      chosenListId: 2,
      reason: 'Need to focus on work',
      setAt: new Date('2026-02-14T20:00:00Z'),
      changedAt: new Date('2026-02-15T08:00:00Z'),
    };

    const result = serializeInitiative(row);

    expect(result).toEqual({
      id: 1,
      userId: 'user-1',
      date: '2026-02-15',
      suggestedListId: 1,
      chosenListId: 2,
      reason: 'Need to focus on work',
      setAt: '2026-02-14T20:00:00.000Z',
      changedAt: '2026-02-15T08:00:00.000Z',
    });
  });

  it('should handle null optional fields', () => {
    const row = {
      id: 2,
      userId: 'user-1',
      date: new Date('2026-02-16'),
      suggestedListId: 1,
      chosenListId: null,
      reason: null,
      setAt: new Date('2026-02-15T20:00:00Z'),
      changedAt: null,
    };

    const result = serializeInitiative(row);

    expect(result.chosenListId).toBeNull();
    expect(result.reason).toBeNull();
    expect(result.changedAt).toBeNull();
  });
});

describe('serializeInitiativeWithLists', () => {
  it('should include list names in serialized initiative', () => {
    const row = {
      id: 1,
      userId: 'user-1',
      date: new Date('2026-02-15'),
      suggestedListId: 1,
      chosenListId: 2,
      reason: null,
      setAt: new Date('2026-02-14T20:00:00Z'),
      changedAt: null,
    };

    const listMap = new Map<number, string>([
      [1, 'Work'],
      [2, 'Personal'],
    ]);

    const result = serializeInitiativeWithLists(row, listMap);

    expect(result.suggestedListName).toBe('Work');
    expect(result.chosenListName).toBe('Personal');
    expect(result.effectiveListName).toBe('Personal');
  });

  it('should use suggested list as effective when chosen is null', () => {
    const row = {
      id: 2,
      userId: 'user-1',
      date: new Date('2026-02-16'),
      suggestedListId: 1,
      chosenListId: null,
      reason: null,
      setAt: new Date('2026-02-15T20:00:00Z'),
      changedAt: null,
    };

    const listMap = new Map<number, string>([[1, 'Work']]);

    const result = serializeInitiativeWithLists(row, listMap);

    expect(result.suggestedListName).toBe('Work');
    expect(result.chosenListName).toBeNull();
    expect(result.effectiveListName).toBe('Work');
  });

  it('should handle missing list names gracefully', () => {
    const row = {
      id: 3,
      userId: 'user-1',
      date: new Date('2026-02-17'),
      suggestedListId: 99,
      chosenListId: null,
      reason: null,
      setAt: new Date('2026-02-16T20:00:00Z'),
      changedAt: null,
    };

    const listMap = new Map<number, string>();

    const result = serializeInitiativeWithLists(row, listMap);

    expect(result.suggestedListName).toBeNull();
    expect(result.effectiveListName).toBeNull();
  });
});
