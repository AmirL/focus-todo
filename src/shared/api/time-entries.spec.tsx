import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTimeEntriesQuery, useStartTimerMutation, useStopTimerMutation, useUpdateTimeEntryMutation, useDeleteTimeEntryMutation } from './time-entries';

vi.mock('@/shared/lib/api', () => ({
  fetchBackend: vi.fn(),
}));

import { fetchBackend } from '@/shared/lib/api';

const mockFetch = fetchBackend as ReturnType<typeof vi.fn>;

const timeEntry = { id: 1, taskId: 1, userId: 'u1', startedAt: '2026-03-20T09:00:00Z', endedAt: '2026-03-20T10:00:00Z', durationMinutes: 60, createdAt: '2026-03-20T09:00:00Z' };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useTimeEntriesQuery', () => {
  beforeEach(() => mockFetch.mockReset());

  it('fetches time entries', async () => {
    mockFetch.mockResolvedValue({ entries: [timeEntry] });
    const { result } = renderHook(() => useTimeEntriesQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith('get-time-entries');
  });
});

describe('useStartTimerMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('starts a timer', async () => {
    mockFetch.mockResolvedValue(timeEntry);
    const { result } = renderHook(() => useStartTimerMutation(), { wrapper: createWrapper() });
    result.current.mutate(1);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('start-timer', { taskId: 1 });
  });
});

describe('useStopTimerMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('stops the timer', async () => {
    mockFetch.mockResolvedValue(timeEntry);
    const { result } = renderHook(() => useStopTimerMutation(), { wrapper: createWrapper() });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('stop-timer', {});
  });
});

describe('useUpdateTimeEntryMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('updates a time entry', async () => {
    mockFetch.mockResolvedValue(timeEntry);
    const { result } = renderHook(() => useUpdateTimeEntryMutation(), { wrapper: createWrapper() });
    result.current.mutate({ id: 1, startedAt: '2026-03-20T08:00:00Z' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('update-time-entry', { id: 1, startedAt: '2026-03-20T08:00:00Z' });
  });
});

describe('useDeleteTimeEntryMutation', () => {
  beforeEach(() => mockFetch.mockReset());

  it('deletes a time entry', async () => {
    mockFetch.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDeleteTimeEntryMutation(), { wrapper: createWrapper() });
    result.current.mutate(1);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('delete-time-entry', { id: 1 });
  });
});
