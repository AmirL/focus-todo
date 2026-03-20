import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskMetadata } from './useTaskMetadata';

describe('useTaskMetadata', () => {
  it('returns default metadata', () => {
    const { result } = renderHook(() => useTaskMetadata());
    expect(result.current.metadata).toEqual({
      selectedDuration: null,
      selectedListId: null,
      isStarred: false,
      isBlocker: false,
      selectedDate: null,
      selectedGoalId: null,
    });
  });

  it('accepts initial metadata overrides', () => {
    const { result } = renderHook(() => useTaskMetadata({ isStarred: true, selectedListId: 5 }));
    expect(result.current.metadata.isStarred).toBe(true);
    expect(result.current.metadata.selectedListId).toBe(5);
    expect(result.current.metadata.isBlocker).toBe(false);
  });

  it('updates metadata partially', () => {
    const { result } = renderHook(() => useTaskMetadata());
    act(() => result.current.updateMetadata({ isBlocker: true }));
    expect(result.current.metadata.isBlocker).toBe(true);
    expect(result.current.metadata.isStarred).toBe(false);
  });

  it('updates multiple fields at once', () => {
    const { result } = renderHook(() => useTaskMetadata());
    act(() => result.current.updateMetadata({ selectedDuration: 30, selectedListId: 2, isStarred: true }));
    expect(result.current.metadata.selectedDuration).toBe(30);
    expect(result.current.metadata.selectedListId).toBe(2);
    expect(result.current.metadata.isStarred).toBe(true);
  });

  it('resets metadata to defaults plus initial', () => {
    const { result } = renderHook(() => useTaskMetadata({ selectedListId: 3 }));
    act(() => result.current.updateMetadata({ isBlocker: true, selectedDuration: 60 }));
    expect(result.current.metadata.isBlocker).toBe(true);

    act(() => result.current.resetMetadata());
    expect(result.current.metadata.isBlocker).toBe(false);
    expect(result.current.metadata.selectedListId).toBe(3);
    expect(result.current.metadata.selectedDuration).toBeNull();
  });
});
