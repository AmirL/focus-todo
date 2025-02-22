import { GoalModel } from '@/entities/goal/model/goal';
import { API } from '@/shared/lib/api';
import { create } from 'zustand';

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
    const data = await API.getGoals();
    set({ goals: GoalModel.fromPlainArray(data.goals), isLoading: false });
  },
}));
