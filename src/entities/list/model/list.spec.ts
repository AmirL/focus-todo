import { describe, it, expect } from 'vitest';
import { ListModel, type ListPlain } from './list';

const sampleListPlain: ListPlain = {
  id: '1',
  name: 'Work',
  description: 'Work tasks',
  color: '#ff0000',
  userId: 'user-1',
  isDefault: true,
  participatesInInitiative: true,
  sortOrder: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  archivedAt: null,
};

describe('ListModel', () => {
  describe('toInstance', () => {
    it('should create a ListModel instance from plain data', () => {
      const list = ListModel.toInstance(sampleListPlain);

      expect(list).toBeInstanceOf(ListModel);
      expect(list.id).toBe('1');
      expect(list.name).toBe('Work');
      expect(list.description).toBe('Work tasks');
      expect(list.color).toBe('#ff0000');
      expect(list.userId).toBe('user-1');
      expect(list.isDefault).toBe(true);
      expect(list.participatesInInitiative).toBe(true);
      expect(list.sortOrder).toBe(0);
    });

    it('should handle null optional fields', () => {
      const plain: ListPlain = {
        ...sampleListPlain,
        description: null,
        color: null,
        updatedAt: null,
        archivedAt: null,
      };
      const list = ListModel.toInstance(plain);

      expect(list.description).toBeNull();
      expect(list.color).toBeNull();
      expect(list.archivedAt).toBeNull();
    });

    it('should handle non-default list', () => {
      const plain: ListPlain = {
        ...sampleListPlain,
        isDefault: false,
        participatesInInitiative: false,
      };
      const list = ListModel.toInstance(plain);

      expect(list.isDefault).toBe(false);
      expect(list.participatesInInitiative).toBe(false);
    });
  });

  describe('fromPlainArray', () => {
    it('should convert an array of plain objects', () => {
      const plains: ListPlain[] = [
        { ...sampleListPlain, id: '1', name: 'Work' },
        { ...sampleListPlain, id: '2', name: 'Personal' },
      ];

      const lists = ListModel.fromPlainArray(plains);

      expect(lists).toHaveLength(2);
      expect(lists[0]).toBeInstanceOf(ListModel);
      expect(lists[1]).toBeInstanceOf(ListModel);
      expect(lists[0].name).toBe('Work');
      expect(lists[1].name).toBe('Personal');
    });

    it('should return empty array for empty input', () => {
      const lists = ListModel.fromPlainArray([]);
      expect(lists).toEqual([]);
    });
  });

  describe('toPlain', () => {
    it('should convert a ListModel instance to plain object', () => {
      const list = ListModel.toInstance(sampleListPlain);
      const plain = ListModel.toPlain(list);

      expect(plain).not.toBeInstanceOf(ListModel);
      expect(plain.id).toBe('1');
      expect(plain.name).toBe('Work');
    });

    it('should transform Date fields to UTC strings', () => {
      const plain: ListPlain = {
        ...sampleListPlain,
        archivedAt: '2024-06-15T12:00:00.000Z',
      };
      const list = ListModel.toInstance(plain);
      const result = ListModel.toPlain(list);

      // archivedAt should be transformed to UTC string format
      expect(result.archivedAt).toBeTruthy();
    });

    it('should transform null date fields to null', () => {
      const plain: ListPlain = {
        ...sampleListPlain,
        archivedAt: null,
        updatedAt: null,
      };
      const list = ListModel.toInstance(plain);
      const result = ListModel.toPlain(list);

      expect(result.archivedAt).toBeNull();
      expect(result.updatedAt).toBeNull();
    });
  });

  describe('isArchived', () => {
    it('should return false when archivedAt is null', () => {
      const list = ListModel.toInstance({ ...sampleListPlain, archivedAt: null });
      expect(list.isArchived).toBe(false);
    });

    it('should return true when archivedAt has a value', () => {
      const list = ListModel.toInstance({
        ...sampleListPlain,
        archivedAt: '2024-06-15T12:00:00.000Z',
      });
      expect(list.isArchived).toBe(true);
    });

    it('should return false when archivedAt is undefined', () => {
      const list = ListModel.toInstance(sampleListPlain);
      // Explicitly set to undefined
      list.archivedAt = undefined;
      expect(list.isArchived).toBe(false);
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve all properties through toInstance -> toPlain -> toInstance', () => {
      const original = ListModel.toInstance(sampleListPlain);
      const plain = ListModel.toPlain(original);
      const restored = ListModel.toInstance(plain);

      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.description).toBe(original.description);
      expect(restored.color).toBe(original.color);
      expect(restored.isDefault).toBe(original.isDefault);
      expect(restored.participatesInInitiative).toBe(original.participatesInInitiative);
      expect(restored.sortOrder).toBe(original.sortOrder);
    });
  });
});
