import { create } from 'zustand';

export enum StatusFilterEnum {
  SELECTED = 'selected',
  FUTURE = 'future',
  ACTIVE = 'active',
}

type FilterState = {
  statusFilter: StatusFilterEnum;
  list: string;
  setStatusFilter: (filter: StatusFilterEnum) => void;
  setList: (list: string) => void;
};

export const useFilterStore = create<FilterState>((set, get) => ({
  statusFilter: StatusFilterEnum.ACTIVE,
  list: '',

  setStatusFilter: (filter) => {
    if (filter === get().statusFilter) return set({ statusFilter: StatusFilterEnum.ACTIVE });
    return set({ statusFilter: filter });
  },
  setList: (list) => {
    if (list === get().list) return set({ list: '' });
    return set({ list });
  },
}));
