import { create } from 'zustand';

export enum StatusFilterEnum {
  SELECTED = 'selected',
  FUTURE = 'future',
  BACKLOG = 'backlog',
  TODAY = 'today',
}

type FilterState = {
  statusFilter: StatusFilterEnum;
  list: string;
  setStatusFilter: (filter: StatusFilterEnum) => void;
  setList: (list: string) => void;
};

export const useFilterStore = create<FilterState>((set, get) => ({
  statusFilter: StatusFilterEnum.BACKLOG,
  list: '',

  setStatusFilter: (filter) => {
    if (filter === get().statusFilter) return set({ statusFilter: StatusFilterEnum.BACKLOG });
    return set({ statusFilter: filter });
  },
  setList: (list) => {
    if (list === get().list) return set({ list: '' });
    return set({ list });
  },
}));
