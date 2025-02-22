import { GoalModel } from '@/shared/model/goal';
import { create } from 'zustand';
import { fetchAllGoals } from '../api/fetchAllGoals';

type GoalsState = {
  goals: GoalModel[];
  isLoading: boolean;
  fetchGoals: () => Promise<void>;
};

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoading: true,
  fetchGoals: async () => {
    set({ isLoading: true });
    const goals = await fetchAllGoals();
    set({ goals: goals, isLoading: false });
  },
}));
