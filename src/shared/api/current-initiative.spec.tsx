import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentInitiativeQuery, useInitiativeHistoryQuery, useSetInitiativeMutation, useChangeInitiativeMutation } from './current-initiative';

vi.mock('@/shared/lib/api', () => ({
  fetchBackend: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
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

describe('useCurrentInitiativeQuery', () => {
  beforeEach(() => mockFetch.mockReset());

  it('fetches current initiative', async () => {
    mockFetch.mockResolvedValue({ today: null, tomorrow: null, suggestedList: null, balance: [], participatingLists: [] });
    const { result } = renderHook(() => useCurrentInitiativeQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('current-initiative', undefined, 'GET');
  });
});

describe('useInitiativeHistoryQuery', () => {
  beforeEach(() => mockFetch.mockReset());

  it('fetches initiative history', async () => {
    mockFetch.mockResolvedValue({ initiatives: [], balance: [], period: { startDate: '', endDate: '', days: 30 } });
    const { result } = renderHook(() => useInitiativeHistoryQuery(30), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('current-initiative/history?days=30', undefined, 'GET');
  });
});

describe('useSetInitiativeMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sets initiative', async () => {
    mockFetch.mockResolvedValue({ initiative: {} });
    const { result } = renderHook(() => useSetInitiativeMutation(), { wrapper: createWrapper() });
    result.current.mutate({ listId: 1 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('current-initiative', expect.objectContaining({ listId: 1 }));
  });
});

describe('useChangeInitiativeMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('changes initiative for a date', async () => {
    mockFetch.mockResolvedValue({ initiative: {} });
    const { result } = renderHook(() => useChangeInitiativeMutation(), { wrapper: createWrapper() });
    result.current.mutate({ date: '2026-03-20', listId: 2 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('current-initiative/2026-03-20', expect.objectContaining({ listId: 2 }), 'PATCH');
  });
});
