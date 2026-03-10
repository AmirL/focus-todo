import { useEffect } from 'react';
import { useTimeEntriesQuery } from '@/shared/api/time-entries';
import { useTimerStore } from './timerStore';

/** Syncs the running timer entry from the server into the Zustand store on load */
export function useTimerSync() {
  const { data: entries } = useTimeEntriesQuery();
  const setActiveEntry = useTimerStore((s) => s.setActiveEntry);
  const activeEntry = useTimerStore((s) => s.activeEntry);

  useEffect(() => {
    if (!entries) return;
    const running = entries.find((e) => !e.endedAt);
    // Only set if there is no active entry or if the running entry changed
    if (running && running.id !== activeEntry?.id) {
      setActiveEntry(running);
    } else if (!running && activeEntry && !activeEntry.endedAt) {
      // Running entry was stopped externally
      setActiveEntry(null);
    }
  }, [entries, activeEntry, setActiveEntry]);
}
