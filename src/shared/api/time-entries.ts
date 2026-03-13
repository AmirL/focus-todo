import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBackend } from '@/shared/lib/api';

export type TimeEntry = {
  id: number;
  taskId: number;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  createdAt: string;
};

export const timeEntryKeys = {
  all: ['time-entries'] as const,
  byTask: (taskId: number) => [...timeEntryKeys.all, 'task', taskId] as const,
  running: () => [...timeEntryKeys.all, 'running'] as const,
};

export function useTimeEntriesQuery() {
  return useQuery({
    queryKey: timeEntryKeys.all,
    queryFn: async () => {
      const data = await fetchBackend<{ entries: TimeEntry[] }>('get-time-entries');
      return data.entries;
    },
    staleTime: 30 * 1000,
  });
}

export function useStartTimerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      return await fetchBackend<TimeEntry>('start-timer', { taskId });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all });
    },
  });
}

export function useStopTimerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await fetchBackend<TimeEntry>('stop-timer', {});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all });
    },
  });
}

export function useUpdateTimeEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: number; startedAt?: string; endedAt?: string }) => {
      return await fetchBackend<TimeEntry>('update-time-entry', data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all });
    },
  });
}

export function useDeleteTimeEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await fetchBackend<{ success: boolean }>('delete-time-entry', { id });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all });
    },
  });
}
