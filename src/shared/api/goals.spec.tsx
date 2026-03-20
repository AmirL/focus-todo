import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGoalsQuery, useCreateGoalMutation, useUpdateGoalMutation } from './goals';

vi.mock('@/shared/lib/api', () => ({
  fetchBackend: vi.fn(),
}));

import { fetchBackend } from '@/shared/lib/api';

const mockFetch = fetchBackend as ReturnType<typeof vi.fn>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const goalPlain = { id: '1', title: 'Test Goal', listId: 1, progress: 0, createdAt: '2026-01-01', completedAt: null };

describe('useGoalsQuery', () => {
  beforeEach(() => mockFetch.mockReset());

  it('fetches goals', async () => {
    mockFetch.mockResolvedValue({ goals: [goalPlain] });
    const { result } = renderHook(() => useGoalsQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith('get-goals');
  });
});

describe('useCreateGoalMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('creates a goal', async () => {
    mockFetch.mockResolvedValue(goalPlain);
    const { result } = renderHook(() => useCreateGoalMutation(), { wrapper: createWrapper() });

    const { GoalModel } = await import('@/entities/goal');
    const goal = new GoalModel();
    Object.assign(goal, { id: '1', title: 'Test Goal', listId: 1, progress: 0 });

    result.current.mutate(goal);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('create-goal', expect.any(Object));
  });
});

describe('useUpdateGoalMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('updates a goal', async () => {
    mockFetch.mockResolvedValue(goalPlain);
    const { result } = renderHook(() => useUpdateGoalMutation(), { wrapper: createWrapper() });

    const { GoalModel } = await import('@/entities/goal');
    const goal = new GoalModel();
    Object.assign(goal, { id: '1', title: 'Updated', listId: 1, progress: 50 });

    result.current.mutate(goal);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('update-goal', expect.objectContaining({ id: '1' }));
  });
});
