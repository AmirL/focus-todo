'use client';

import { create } from 'zustand';
import { getSearchParam, updateSearchParams, validateEnumValue } from '@/shared/lib/url-utils';

export enum StatusFilterEnum {
  SELECTED = 'selected',
  FUTURE = 'future',
  BACKLOG = 'backlog',
  TODAY = 'today',
  TOMORROW = 'tomorrow',
}

type FilterState = {
  statusFilter: StatusFilterEnum;
  listId: string;
  setStatusFilter: (filter: StatusFilterEnum) => void;
  setListId: (listId: string) => void;
  initializeFromURL: () => void;
};

// Helper function to get initial state from URL
function getInitialStateFromURL(): { statusFilter: StatusFilterEnum; listId: string } {
  const filterParam = getSearchParam('filter');
  const listIdParam = getSearchParam('listId') || '';

  const statusFilter = validateEnumValue(filterParam, StatusFilterEnum, StatusFilterEnum.BACKLOG);

  return { statusFilter, listId: listIdParam };
}

// Helper function to update URL
function updateURL(statusFilter: StatusFilterEnum, listId: string) {
  updateSearchParams({
    filter: statusFilter !== StatusFilterEnum.BACKLOG ? statusFilter : null,
    listId: listId || null,
  });
}

export const useFilterStore = create<FilterState>((set, get) => ({
  statusFilter: StatusFilterEnum.BACKLOG,
  listId: '',

  setStatusFilter: (filter) => {
    set({ statusFilter: filter });
    updateURL(filter, get().listId);
  },
  setListId: (listId) => {
    const currentListId = get().listId;
    const newListId = listId === currentListId ? '' : listId;
    set({ listId: newListId });
    updateURL(get().statusFilter, newListId);
  },
  initializeFromURL: () => {
    const initialState = getInitialStateFromURL();
    set(initialState);
  },
}));
