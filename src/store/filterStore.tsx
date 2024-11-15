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

  setSpecialFilter: (filter) => set({ specialFilter: filter }),
  setList: (list) => set({ list }),
}));
