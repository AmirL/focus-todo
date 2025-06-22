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
  list: string;
  setStatusFilter: (filter: StatusFilterEnum) => void;
  setList: (list: string) => void;
  initializeFromURL: () => void;
};

// Helper function to get initial state from URL
function getInitialStateFromURL(): { statusFilter: StatusFilterEnum; list: string } {
  const filterParam = getSearchParam('filter');
  const listParam = getSearchParam('list') || '';

  const statusFilter = validateEnumValue(filterParam, StatusFilterEnum, StatusFilterEnum.BACKLOG);

  return { statusFilter, list: listParam };
}

// Helper function to update URL
function updateURL(statusFilter: StatusFilterEnum, list: string) {
  updateSearchParams({
    filter: statusFilter !== StatusFilterEnum.BACKLOG ? statusFilter : null,
    list: list || null,
  });
}

export const useFilterStore = create<FilterState>((set, get) => ({
  statusFilter: StatusFilterEnum.BACKLOG,
  list: '',

  setStatusFilter: (filter) => {
    set({ statusFilter: filter });
    updateURL(filter, get().list);
  },
  setList: (list) => {
    const currentList = get().list;
    const newList = list === currentList ? '' : list;
    set({ list: newList });
    updateURL(get().statusFilter, newList);
  },
  initializeFromURL: () => {
    const initialState = getInitialStateFromURL();
    set(initialState);
  },
}));
