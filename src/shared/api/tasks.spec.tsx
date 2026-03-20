import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useCreateCompletedTaskMutation } from './tasks';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';

// Mock fetchBackend
vi.mock('@/shared/lib/api', () => ({
  fetchBackend: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { fetchBackend } from '@/shared/lib/api';

const mockFetch = fetchBackend as ReturnType<typeof vi.fn>;

function makeTask(overrides: Partial<TaskModel> = {}): TaskModel {
  return createInstance(TaskModel, {
    id: 'task-1',
    name: 'Test Task',
    listId: 1,
    isBlocker: false,
    selectedAt: null,
    deletedAt: null,
    date: null,
    estimatedDuration: null,
    completedAt: null,
    sortOrder: 0,
    ...overrides,
  });
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useTasksQuery', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches tasks and returns TaskModel array', async () => {
    mockFetch.mockResolvedValue({
      tasks: [{ id: 'task-1', name: 'Test', listId: 1, isBlocker: false, selectedAt: null, deletedAt: null, date: null, estimatedDuration: null, completedAt: null, sortOrder: 0 }],
    });

    const { result } = renderHook(() => useTasksQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith('get-tasks');
  });

  it('handles error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTasksQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCreateTaskMutation', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('creates a task', async () => {
    const taskPlain = { id: 'task-2', name: 'New Task', listId: 1, isBlocker: false, selectedAt: null, deletedAt: null, date: null, estimatedDuration: null, completedAt: null, sortOrder: 0 };
    mockFetch.mockResolvedValue(taskPlain);

    const { result } = renderHook(() => useCreateTaskMutation(), { wrapper: createWrapper() });

    const newTask = makeTask({ id: 'task-2', name: 'New Task' });
    result.current.mutate(newTask);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('create-task', expect.any(Object));
  });
});

describe('useUpdateTaskMutation', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('updates a task', async () => {
    const taskPlain = { id: 'task-1', name: 'Updated', listId: 1, isBlocker: false, selectedAt: null, deletedAt: null, date: null, estimatedDuration: null, completedAt: null, sortOrder: 0 };
    mockFetch.mockResolvedValue(taskPlain);

    const { result } = renderHook(() => useUpdateTaskMutation(), { wrapper: createWrapper() });

    const task = makeTask({ name: 'Updated' });
    result.current.mutate(task);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('update-task', expect.objectContaining({ id: 'task-1' }));
  });
});

describe('useCreateCompletedTaskMutation', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('creates a completed task with time entry', async () => {
    mockFetch.mockResolvedValue({
      task: { id: 'task-3', name: 'Done Task', listId: 1, isBlocker: false, selectedAt: null, deletedAt: null, date: null, estimatedDuration: null, completedAt: '2026-03-20', sortOrder: 0 },
      timeEntry: { id: 1, taskId: 3, startedAt: '2026-03-20T09:00:00Z', endedAt: '2026-03-20T10:00:00Z' },
    });

    const { result } = renderHook(() => useCreateCompletedTaskMutation(), { wrapper: createWrapper() });

    result.current.mutate({
      task: { name: 'Done Task', listId: 1 },
      startedAt: '2026-03-20T09:00:00Z',
      endedAt: '2026-03-20T10:00:00Z',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('create-completed-task', expect.any(Object));
  });
});
