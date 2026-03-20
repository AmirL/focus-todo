import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGoalMilestonesQuery, useCreateMilestoneMutation } from './goal-milestones';

vi.mock('@/shared/lib/api', () => ({
  fetchBackend: vi.fn(),
}));

import { fetchBackend } from '@/shared/lib/api';

const mockFetch = fetchBackend as ReturnType<typeof vi.fn>;

const milestonePlain = { id: '1', goalId: '1', progress: 50, description: 'Halfway', createdAt: '2026-01-01' };
const goalPlain = { id: '1', title: 'Test Goal', listId: 1, progress: 50, createdAt: '2026-01-01', completedAt: null };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useGoalMilestonesQuery', () => {
  beforeEach(() => mockFetch.mockReset());

  it('fetches milestones for a goal', async () => {
    mockFetch.mockResolvedValue({ milestones: [milestonePlain] });
    const { result } = renderHook(() => useGoalMilestonesQuery('1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith('get-goal-milestones', { goalId: 1 });
  });
});

describe('useCreateMilestoneMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('creates a milestone', async () => {
    mockFetch.mockResolvedValue({ milestone: milestonePlain, goal: goalPlain });
    const { result } = renderHook(() => useCreateMilestoneMutation(), { wrapper: createWrapper() });
    result.current.mutate({ goalId: '1', progress: 50, description: 'Halfway' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('create-goal-milestone', { goalId: 1, progress: 50, description: 'Halfway' });
  });
});
