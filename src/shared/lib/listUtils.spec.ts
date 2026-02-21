import { describe, it, expect } from 'vitest';
import { buildListIdToNameMap, getListName } from '@/shared/lib/listUtils';
import type { ListModel } from '@/entities/list';

// Create minimal list-like objects for testing pure functions
function createList(id: string | number, name: string): ListModel {
  return { id: String(id), name } as ListModel;
}

describe('buildListIdToNameMap', () => {
  it('should return an empty map for an empty list', () => {
    const result = buildListIdToNameMap([]);
    expect(result.size).toBe(0);
  });

  it('should build a map from list id to name', () => {
    const lists = [createList(1, 'Work'), createList(2, 'Personal')];
    const result = buildListIdToNameMap(lists);

    expect(result.size).toBe(2);
    expect(result.get(1)).toBe('Work');
    expect(result.get(2)).toBe('Personal');
  });

  it('should handle string ids by converting to numbers', () => {
    const lists = [createList('3', 'Side Project')];
    const result = buildListIdToNameMap(lists);

    expect(result.get(3)).toBe('Side Project');
  });

  it('should handle a single list', () => {
    const lists = [createList(1, 'Work')];
    const result = buildListIdToNameMap(lists);

    expect(result.size).toBe(1);
    expect(result.get(1)).toBe('Work');
  });
});

describe('getListName', () => {
  const lists = [createList(1, 'Work'), createList(2, 'Personal'), createList(3, 'Side Project')];

  it('should return the list name for a matching id', () => {
    expect(getListName(lists, 1)).toBe('Work');
    expect(getListName(lists, 2)).toBe('Personal');
    expect(getListName(lists, 3)).toBe('Side Project');
  });

  it('should return "Unknown" for a non-matching id', () => {
    expect(getListName(lists, 99)).toBe('Unknown');
  });

  it('should return "Unknown" for an empty list array', () => {
    expect(getListName([], 1)).toBe('Unknown');
  });
});
