import { create } from 'zustand';

export type SpecialFilter = 'selected' | 'future' | 'all';

type FilterState = {
  specialFilter: SpecialFilter;
  list: string;
  setSpecialFilter: (filter: SpecialFilter) => void;
  setList: (list: string) => void;
};

export const useFilterStore = create<FilterState>((set, get) => ({
  specialFilter: 'all',
  list: '',

  setSpecialFilter: (filter) => {
    if (filter === get().specialFilter) return set({ specialFilter: 'all' });
    return set({ specialFilter: filter });
  },
  setList: (list) => {
    if (list === get().list) return set({ list: '' });
    return set({ list });
  },
}));
