import { describe, it, expect } from 'vitest';
import {
  resolveCurrentListId,
  detectUnsavedChanges,
  resolveSelection,
} from './bannerUtils';

describe('resolveCurrentListId', () => {
  it('returns pendingListId when all values are set', () => {
    expect(resolveCurrentListId(3, 2, 1)).toBe(3);
  });

  it('falls back to existingListId when pending is null', () => {
    expect(resolveCurrentListId(null, 2, 1)).toBe(2);
  });

  it('falls back to suggestedListId when pending and existing are null', () => {
    expect(resolveCurrentListId(null, null, 1)).toBe(1);
  });

  it('returns null when all values are null', () => {
    expect(resolveCurrentListId(null, null, null)).toBeNull();
  });

  it('handles undefined suggestedListId', () => {
    expect(resolveCurrentListId(null, null, undefined)).toBeNull();
  });
});

describe('detectUnsavedChanges', () => {
  describe('when initiative is not set', () => {
    it('returns true when pending is set', () => {
      expect(detectUnsavedChanges(true, 5, null)).toBe(true);
    });

    it('returns false when pending is null', () => {
      expect(detectUnsavedChanges(true, null, null)).toBe(false);
    });
  });

  describe('when initiative is already set', () => {
    it('returns true when pending differs from existing', () => {
      expect(detectUnsavedChanges(false, 5, 3)).toBe(true);
    });

    it('returns false when pending matches existing', () => {
      expect(detectUnsavedChanges(false, 3, 3)).toBe(false);
    });

    it('returns false when pending is null', () => {
      expect(detectUnsavedChanges(false, null, 3)).toBe(false);
    });
  });
});

describe('resolveSelection', () => {
  it('returns null when selecting already-saved option (clears pending)', () => {
    expect(resolveSelection(5, false, 5)).toBeNull();
  });

  it('returns the listId when selecting a different option', () => {
    expect(resolveSelection(3, false, 5)).toBe(3);
  });

  it('returns the listId when initiative is not set', () => {
    expect(resolveSelection(3, true, null)).toBe(3);
  });

  it('returns the listId when isNotSet even if matches existingListId', () => {
    expect(resolveSelection(5, true, 5)).toBe(5);
  });
});
