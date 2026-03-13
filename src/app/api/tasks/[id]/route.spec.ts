import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock DB
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockSet = vi.fn();
const mockDeleteWhere = vi.fn();
const mockLeftJoin = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
    update: () => ({ set: mockSet }),
    delete: () => ({ where: mockDeleteWhere }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
mockLeftJoin.mockReturnValue({ where: mockWhere });
mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

// Mock auth
vi.mock('@/app/api/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/api/api-auth')>();
  return { ...actual, getUserIdFromApiKey: vi.fn() };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { GET, PATCH, DELETE } from './route';
import { getUserIdFromApiKey, ApiAuthError } from '@/app/api/api-auth';

const mockedGetUserId = vi.mocked(getUserIdFromApiKey);

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as never);
}

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

const sampleTask = {
  id: 1,
  name: 'Test Task',
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

describe('GET /api/tasks/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockLeftJoin.mockReturnValue({ where: mockWhere });
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));
    const res = await GET(makeRequest('http://localhost:3000/api/tasks/1'), makeContext('1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await GET(makeRequest('http://localhost:3000/api/tasks/abc'), makeContext('abc'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid task ID');
  });

  it('returns 404 when task not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([]);
    const res = await GET(makeRequest('http://localhost:3000/api/tasks/999'), makeContext('999'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Task not found');
  });

  it('returns task with listDescription', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([{ task: sampleTask, listDescription: 'Work list' }]);
    const res = await GET(makeRequest('http://localhost:3000/api/tasks/1'), makeContext('1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.task.id).toBe(1);
    expect(body.task.listDescription).toBe('Work list');
  });
});

describe('PATCH /api/tasks/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockLeftJoin.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));
    const res = await PATCH(
      makeRequest('http://localhost:3000/api/tasks/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await PATCH(
      makeRequest('http://localhost:3000/api/tasks/abc', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      makeContext('abc')
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 when task not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([]);
    const res = await PATCH(
      makeRequest('http://localhost:3000/api/tasks/999', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      makeContext('999')
    );
    expect(res.status).toBe(404);
  });

  it('updates task and returns 200', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    // First call: check existing task; Second call: return updated task with join
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([sampleTask]);
      return Promise.resolve([{ task: { ...sampleTask, name: 'Updated' }, listDescription: 'Work' }]);
    });

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/tasks/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.task.name).toBe('Updated');
  });

  it('strips id, userId, and createdAt from update body', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([sampleTask]);
      return Promise.resolve([{ task: sampleTask, listDescription: null }]);
    });

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/tasks/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Test', id: 999, userId: 'hacker', createdAt: '2020-01-01' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/tasks/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    mockDeleteWhere.mockResolvedValue(undefined);
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));
    const res = await DELETE(makeRequest('http://localhost:3000/api/tasks/1'), makeContext('1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await DELETE(makeRequest('http://localhost:3000/api/tasks/abc'), makeContext('abc'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when task not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([]);
    const res = await DELETE(makeRequest('http://localhost:3000/api/tasks/999'), makeContext('999'));
    expect(res.status).toBe(404);
  });

  it('soft deletes a task by default', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([sampleTask]);

    const res = await DELETE(makeRequest('http://localhost:3000/api/tasks/1'), makeContext('1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Task deleted');
  });

  it('hard deletes a task when permanent=true', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([sampleTask]);

    const res = await DELETE(
      makeRequest('http://localhost:3000/api/tasks/1?permanent=true'),
      makeContext('1')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Task permanently deleted');
  });
});
