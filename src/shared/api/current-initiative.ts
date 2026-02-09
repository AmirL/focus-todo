import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBackend } from '@/shared/lib/api';
import type { InitiativeBalance, ListWithLastTouched } from '@/entities/current-initiative';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

// Types for API responses
interface InitiativeRow {
  id: number;
  userId: string;
  date: string;
  suggestedListId: number | null;
  chosenListId: number | null;
  reason: string | null;
  setAt: string;
  changedAt: string | null;
}

interface ListRow {
  id: number;
  name: string;
  userId: string;
  isDefault: boolean;
  participatesInInitiative: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface InitiativeWithList extends InitiativeRow {
  suggestedListName: string | null;
  chosenListName: string | null;
  effectiveListName: string | null;
}

interface CurrentInitiativeResponse {
  today: InitiativeRow | null;
  tomorrow: InitiativeRow | null;
  suggestedList: ListWithLastTouched | null;
  balance: InitiativeBalance[];
  participatingLists: ListRow[];
}

interface HistoryResponse {
  initiatives: InitiativeWithList[];
  balance: InitiativeBalance[];
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

interface SetInitiativeResponse {
  initiative: InitiativeRow;
}

// Query Keys
export const initiativeKeys = {
  all: ['current-initiative'] as const,
  current: () => [...initiativeKeys.all, 'current'] as const,
  history: (days?: number) => [...initiativeKeys.all, 'history', { days }] as const,
  date: (date: string) => [...initiativeKeys.all, 'date', date] as const,
};

/**
 * Fetch current initiative data (today, tomorrow, suggestion, balance)
 */
export function useCurrentInitiativeQuery() {
  return useQuery({
    queryKey: initiativeKeys.current(),
    queryFn: async (): Promise<CurrentInitiativeResponse> => {
      const response = await fetch('/api/current-initiative', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch current initiative');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Fetch initiative history
 */
export function useInitiativeHistoryQuery(days: number = 30) {
  return useQuery({
    queryKey: initiativeKeys.history(days),
    queryFn: async (): Promise<HistoryResponse> => {
      const response = await fetch(`/api/current-initiative/history?days=${days}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch initiative history');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Set tomorrow's initiative
 */
export function useSetInitiativeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      date,
      reason,
    }: {
      listId: number;
      date?: string;
      reason?: string;
    }): Promise<SetInitiativeResponse> => {
      return fetchBackend('current-initiative', { listId, date, reason });
    },
    onSuccess: (_, variables) => {
      const label = variables.date === dayjs().format('YYYY-MM-DD') ? "Today's" : "Tomorrow's";
      toast.success(`${label} focus has been set`);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: initiativeKeys.all });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to set initiative';
      toast.error(message);
    },
  });
}

/**
 * Change an existing initiative for a specific date
 */
export function useChangeInitiativeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      listId,
      reason,
    }: {
      date: string;
      listId: number;
      reason?: string;
    }): Promise<SetInitiativeResponse> => {
      const response = await fetch(`/api/current-initiative/${date}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, reason }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to change initiative');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast.success(`Focus for ${variables.date} has been changed`);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: initiativeKeys.all });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to change initiative';
      toast.error(message);
    },
  });
}
