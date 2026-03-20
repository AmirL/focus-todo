import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFilterStore, StatusFilterEnum } from './filterStore';

// Mock url-utils to avoid browser API dependencies
vi.mock('@/shared/lib/url-utils', () => ({
  getSearchParams: vi.fn(() => new URLSearchParams()),
  updateSearchParams: vi.fn(),
  validateEnumValue: vi.fn(
    (value: string | null, enumObj: Record<string, string>, defaultValue: string) => {
      if (value && Object.values(enumObj).includes(value)) return value;
      return defaultValue;
    }
  ),
}));

describe('useFilterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({
      statusFilter: StatusFilterEnum.BACKLOG,
      listId: '',
    });
  });

  it('has correct initial state', () => {
    const state = useFilterStore.getState();
    expect(state.statusFilter).toBe(StatusFilterEnum.BACKLOG);
    expect(state.listId).toBe('');
  });

  it('setStatusFilter updates the filter', () => {
    useFilterStore.getState().setStatusFilter(StatusFilterEnum.SELECTED);
    expect(useFilterStore.getState().statusFilter).toBe(StatusFilterEnum.SELECTED);
  });

  it('setStatusFilter to FUTURE', () => {
    useFilterStore.getState().setStatusFilter(StatusFilterEnum.FUTURE);
    expect(useFilterStore.getState().statusFilter).toBe(StatusFilterEnum.FUTURE);
  });

  it('setStatusFilter to TODAY', () => {
    useFilterStore.getState().setStatusFilter(StatusFilterEnum.TODAY);
    expect(useFilterStore.getState().statusFilter).toBe(StatusFilterEnum.TODAY);
  });

  it('setStatusFilter to TOMORROW', () => {
    useFilterStore.getState().setStatusFilter(StatusFilterEnum.TOMORROW);
    expect(useFilterStore.getState().statusFilter).toBe(StatusFilterEnum.TOMORROW);
  });

  it('setListId sets a new list ID', () => {
    useFilterStore.getState().setListId('list-1');
    expect(useFilterStore.getState().listId).toBe('list-1');
  });

  it('setListId toggles off when same ID is set again', () => {
    useFilterStore.getState().setListId('list-1');
    expect(useFilterStore.getState().listId).toBe('list-1');

    useFilterStore.getState().setListId('list-1');
    expect(useFilterStore.getState().listId).toBe('');
  });

  it('setListId changes to different list', () => {
    useFilterStore.getState().setListId('list-1');
    useFilterStore.getState().setListId('list-2');
    expect(useFilterStore.getState().listId).toBe('list-2');
  });

  it('initializeFromURL sets state from URL params', () => {
    useFilterStore.getState().initializeFromURL();
    // With mocked empty URLSearchParams, it should use defaults
    const state = useFilterStore.getState();
    expect(state.statusFilter).toBe(StatusFilterEnum.BACKLOG);
    expect(state.listId).toBe('');
  });

  it('StatusFilterEnum has expected values', () => {
    expect(StatusFilterEnum.SELECTED).toBe('selected');
    expect(StatusFilterEnum.FUTURE).toBe('future');
    expect(StatusFilterEnum.BACKLOG).toBe('backlog');
    expect(StatusFilterEnum.TODAY).toBe('today');
    expect(StatusFilterEnum.TOMORROW).toBe('tomorrow');
  });
});
