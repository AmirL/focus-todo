import { create } from 'zustand';

export enum SpecialFilterEnum {
  SELECTED = 'selected',
  FUTURE = 'future',
  ACTIVE = 'active',
}

type FilterState = {
  specialFilter: SpecialFilterEnum;
  list: string;
  setSpecialFilter: (filter: SpecialFilterEnum) => void;
  setList: (list: string) => void;
};

export const useFilterStore = create<FilterState>((set, get) => ({
  specialFilter: SpecialFilterEnum.ACTIVE,
  list: '',

  setSpecialFilter: (filter) => {
    if (filter === get().specialFilter) return set({ specialFilter: SpecialFilterEnum.ACTIVE });
    return set({ specialFilter: filter });
  },
  setList: (list) => {
    if (list === get().list) return set({ list: '' });
    return set({ list });
  },
}));
