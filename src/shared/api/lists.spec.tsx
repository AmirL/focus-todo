import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useListsQuery, useCreateListMutation, useUpdateListMutation, useArchiveListMutation, useDeleteListMutation, useReorderListsMutation } from './lists';

vi.mock('@/shared/lib/api', () => ({
  fetchBackend: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { fetchBackend } from '@/shared/lib/api';

const mockFetch = fetchBackend as ReturnType<typeof vi.fn>;

const listPlain = {
  id: '1', name: 'Work', userId: 'u1', isDefault: true,
  participatesInInitiative: true, sortOrder: 0, color: null,
  description: null, createdAt: '2026-01-01', updatedAt: null, archivedAt: null,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useListsQuery', () => {
  beforeEach(() => mockFetch.mockReset());

  it('fetches lists', async () => {
    mockFetch.mockResolvedValue({ lists: [listPlain] });
    const { result } = renderHook(() => useListsQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('fetches with includeArchived', async () => {
    mockFetch.mockResolvedValue({ lists: [] });
    const { result } = renderHook(() => useListsQuery({ includeArchived: true }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('get-lists', { includeArchived: true });
  });
});

describe('useCreateListMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('creates a list', async () => {
    mockFetch.mockResolvedValue(listPlain);
    const { result } = renderHook(() => useCreateListMutation(), { wrapper: createWrapper() });
    result.current.mutate({ name: 'New List', participatesInInitiative: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('create-list', expect.objectContaining({ name: 'New List' }));
  });
});

describe('useUpdateListMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('updates a list', async () => {
    mockFetch.mockResolvedValue(listPlain);
    const { result } = renderHook(() => useUpdateListMutation(), { wrapper: createWrapper() });
    result.current.mutate({ id: '1', name: 'Updated', participatesInInitiative: false });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('update-list', expect.objectContaining({ id: '1' }));
  });
});

describe('useArchiveListMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('archives a list', async () => {
    mockFetch.mockResolvedValue(listPlain);
    const { result } = renderHook(() => useArchiveListMutation(), { wrapper: createWrapper() });
    result.current.mutate({ id: '1', archived: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('update-list', { id: '1', archived: true });
  });
});

describe('useDeleteListMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('deletes a list', async () => {
    mockFetch.mockResolvedValue('1');
    const { result } = renderHook(() => useDeleteListMutation(), { wrapper: createWrapper() });
    result.current.mutate({ id: '1' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('delete-list', expect.objectContaining({ id: '1' }));
  });
});

describe('useReorderListsMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('reorders lists', async () => {
    mockFetch.mockResolvedValue({});
    const { result } = renderHook(() => useReorderListsMutation(), { wrapper: createWrapper() });
    result.current.mutate(['1', '2', '3']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('reorder-lists', { listIds: ['1', '2', '3'] });
  });
});
