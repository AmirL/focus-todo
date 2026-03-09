import { describe, it, expect, beforeEach } from 'vitest';
import { useTempSelectStore } from './tempSelectStore';

describe('useTempSelectStore', () => {
  beforeEach(() => {
    useTempSelectStore.setState({ selectedTaskIds: [] });
  });

  it('has empty initial selection', () => {
    expect(useTempSelectStore.getState().selectedTaskIds).toEqual([]);
  });

  it('toggleSelection adds a task', () => {
    useTempSelectStore.getState().toggleSelection('task-1');
    expect(useTempSelectStore.getState().selectedTaskIds).toEqual(['task-1']);
  });

  it('toggleSelection removes an already selected task', () => {
    useTempSelectStore.getState().toggleSelection('task-1');
    useTempSelectStore.getState().toggleSelection('task-1');
    expect(useTempSelectStore.getState().selectedTaskIds).toEqual([]);
  });

  it('maintains selection order', () => {
    useTempSelectStore.getState().toggleSelection('task-2');
    useTempSelectStore.getState().toggleSelection('task-1');
    useTempSelectStore.getState().toggleSelection('task-3');
    expect(useTempSelectStore.getState().selectedTaskIds).toEqual(['task-2', 'task-1', 'task-3']);
  });

  it('isSelected returns correct value', () => {
    useTempSelectStore.getState().toggleSelection('task-1');
    expect(useTempSelectStore.getState().isSelected('task-1')).toBe(true);
    expect(useTempSelectStore.getState().isSelected('task-2')).toBe(false);
  });

  it('getLastSelected returns last selected task', () => {
    useTempSelectStore.getState().toggleSelection('task-1');
    useTempSelectStore.getState().toggleSelection('task-2');
    expect(useTempSelectStore.getState().getLastSelected()).toBe('task-2');
  });

  it('getLastSelected returns undefined when empty', () => {
    expect(useTempSelectStore.getState().getLastSelected()).toBeUndefined();
  });

  it('clearSelections empties the selection', () => {
    useTempSelectStore.getState().toggleSelection('task-1');
    useTempSelectStore.getState().toggleSelection('task-2');
    useTempSelectStore.getState().clearSelections();
    expect(useTempSelectStore.getState().selectedTaskIds).toEqual([]);
  });

  it('removing middle item preserves order of others', () => {
    useTempSelectStore.getState().toggleSelection('task-1');
    useTempSelectStore.getState().toggleSelection('task-2');
    useTempSelectStore.getState().toggleSelection('task-3');
    useTempSelectStore.getState().toggleSelection('task-2');
    expect(useTempSelectStore.getState().selectedTaskIds).toEqual(['task-1', 'task-3']);
  });
});
