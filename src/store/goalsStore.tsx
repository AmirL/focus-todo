import { Goal } from '@/data-classes/goal';
import { API } from '@/lib/api';
import { create } from 'zustand';

type GoalsState = {
  goals: Goal[];
  isLoading: boolean;
  fetchGoals: () => Promise<void>;
};

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoading: true,
  fetchGoals: async () => {
    set({ isLoading: true });
    const data = await API.getGoals();
    set({ goals: Goal.fromPlainArray(data.goals), isLoading: false });
  },
}));
