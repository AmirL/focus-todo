import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock DB
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockValues = vi.fn();
const mock$returningId = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
    insert: () => ({ values: mockValues }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockWhere.mockReturnValue({ limit: mockLimit });
mockValues.mockReturnValue({ $returningId: mock$returningId });

// Mock auth
vi.mock('@/app/api/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/api/api-auth')>();
  return { ...actual, getUserIdFromApiKey: vi.fn() };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

// Mock buildTaskListConditions
vi.mock('./buildTaskListConditions', () => ({
  buildTaskListConditions: vi.fn(() => []),
}));

import { GET, POST } from './route';
import { getUserIdFromApiKey, ApiAuthError } from '@/app/api/api-auth';

const mockedGetUserId = vi.mocked(getUserIdFromApiKey);

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as never);
}

describe('GET /api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
  });

  it('returns 401 when no API key is provided', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));
    const res = await GET(makeRequest('http://localhost:3000/api/tasks'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('API key required');
  });

  it('returns tasks with default limit of 100', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const mockTask = {
      id: 1,
      name: 'Test Task',
      date: new Date('2026-03-01T10:00:00Z'),
      completedAt: null,
      deletedAt: null,
      selectedAt: null,
      updatedAt: new Date('2026-03-01T10:00:00Z'),
      createdAt: new Date('2026-03-01T10:00:00Z'),
      __list_deprecated: '',
      listId: 1,
      userId: 'user-1',
    };
    mockLimit.mockResolvedValue([mockTask]);

    const res = await GET(makeRequest('http://localhost:3000/api/tasks'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tasks).toHaveLength(1);
    expect(body.tasks[0]).not.toHaveProperty('__list_deprecated');
  });

  it('clamps limit between 1 and 500', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockLimit.mockResolvedValue([]);

    await GET(makeRequest('http://localhost:3000/api/tasks?limit=1000'));
    expect(mockLimit).toHaveBeenCalledWith(500);

    await GET(makeRequest('http://localhost:3000/api/tasks?limit=0'));
    expect(mockLimit).toHaveBeenCalledWith(1);
  });

  it('applies timezone offset to date fields', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const mockTask = {
      id: 1,
      name: 'Task',
      date: new Date('2026-03-01T00:00:00Z'),
      completedAt: null,
      deletedAt: null,
      selectedAt: null,
      updatedAt: null,
      createdAt: new Date('2026-03-01T00:00:00Z'),
      __list_deprecated: '',
      listId: 1,
      userId: 'user-1',
    };
    mockLimit.mockResolvedValue([mockTask]);

    // tzOffset=-120 means UTC+2; the response should include +02:00 suffix
    const res = await GET(makeRequest('http://localhost:3000/api/tasks?tzOffset=-120'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tasks[0].date).toMatch(/\+02:00$/);
    // Verify the date string has a valid ISO-like format with offset
    expect(body.tasks[0].date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });

  it('returns empty array when no tasks found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockLimit.mockResolvedValue([]);

    const res = await GET(makeRequest('http://localhost:3000/api/tasks'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tasks).toEqual([]);
  });
});

describe('POST /api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ $returningId: mock$returningId });
  });

  it('returns 401 when no API key is provided', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));
    const res = await POST(
      makeRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', listId: 1 }),
      })
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ listId: 1 }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Task name is required');
  });

  it('returns 400 when name is empty string', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ name: '  ', listId: 1 }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Task name is required');
  });

  it('returns 400 when listId is missing', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Task listId is required (number)');
  });

  it('returns 400 when listId is not a number', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', listId: 'abc' }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Task listId is required (number)');
  });

  it('creates a task and returns 201', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mock$returningId.mockResolvedValue([{ id: 42 }]);

    const createdTask = {
      id: 42,
      name: 'New Task',
      details: null,
      date: null,
      estimatedDuration: null,
      completedAt: null,
      deletedAt: null,
      selectedAt: null,
      updatedAt: new Date('2026-03-01T10:00:00Z'),
      createdAt: new Date('2026-03-01T10:00:00Z'),
      __list_deprecated: '',
      listId: 1,
      isBlocker: false,
      uid: null,
      userId: 'user-1',
      sortOrder: 0,
      aiSuggestions: null,
      goalId: null,
    };
    mockWhere.mockResolvedValue([createdTask]);

    const res = await POST(
      makeRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Task', listId: 1 }),
      })
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.task.id).toBe(42);
    expect(body.task.name).toBe('New Task');
    expect(body.task).not.toHaveProperty('__list_deprecated');
  });

  it('strips id, userId, and createdAt from request body', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mock$returningId.mockResolvedValue([{ id: 1 }]);
    const createdTask = {
      id: 1,
      name: 'Task',
      details: null,
      date: null,
      estimatedDuration: null,
      completedAt: null,
      deletedAt: null,
      selectedAt: null,
      updatedAt: new Date(),
      createdAt: new Date(),
      __list_deprecated: '',
      listId: 1,
      isBlocker: false,
      uid: null,
      userId: 'user-1',
      sortOrder: 0,
      aiSuggestions: null,
      goalId: null,
    };
    mockWhere.mockResolvedValue([createdTask]);

    const res = await POST(
      makeRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Task',
          listId: 1,
          id: 999,
          userId: 'hacker',
          createdAt: '2020-01-01',
        }),
      })
    );
    expect(res.status).toBe(201);
  });
});
