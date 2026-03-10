import { create } from 'zustand';
import type { TimeEntry } from '@/shared/api/time-entries';

type TimerState = {
  activeEntry: TimeEntry | null;
  setActiveEntry: (entry: TimeEntry | null) => void;
};

export const useTimerStore = create<TimerState>((set) => ({
  activeEntry: null,
  setActiveEntry: (entry) => set({ activeEntry: entry }),
}));
