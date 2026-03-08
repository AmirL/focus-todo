import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock DB
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLeftJoin = vi.fn();
const mockSet = vi.fn();
const mockDeleteWhere = vi.fn();

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
vi.mock('@/app/api/api-auth', () => ({
  getUserIdFromApiKey: vi.fn(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { GET, PATCH, DELETE } from './route';
import { getUserIdFromApiKey } from '@/app/api/api-auth';

const mockedGetUserId = vi.mocked(getUserIdFromApiKey);

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as never);
}

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

const sampleGoal = {
  id: 1,
  title: 'Test Goal',
  description: 'desc',
  progress: 50,
  listId: 1,
  userId: 'user-1',
  deletedAt: null,
  __list_deprecated: '',
};

describe('GET /api/goals/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockLeftJoin.mockReturnValue({ where: mockWhere });
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new Error('API key required'));
    const res = await GET(makeRequest('http://localhost:3000/api/goals/1'), makeContext('1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await GET(makeRequest('http://localhost:3000/api/goals/abc'), makeContext('abc'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid goal ID');
  });

  it('returns 404 when goal not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([]);
    const res = await GET(makeRequest('http://localhost:3000/api/goals/999'), makeContext('999'));
    expect(res.status).toBe(404);
  });

  it('returns goal with listName', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([{ goal: sampleGoal, listName: 'Work' }]);

    const res = await GET(makeRequest('http://localhost:3000/api/goals/1'), makeContext('1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.goal.id).toBe(1);
    expect(body.goal.listName).toBe('Work');
    expect(body.goal).not.toHaveProperty('__list_deprecated');
  });
});

describe('PATCH /api/goals/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockLeftJoin.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new Error('API key required'));
    const res = await PATCH(
      makeRequest('http://localhost:3000/api/goals/1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await PATCH(
      makeRequest('http://localhost:3000/api/goals/abc', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      }),
      makeContext('abc')
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 when goal not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([]);
    const res = await PATCH(
      makeRequest('http://localhost:3000/api/goals/999', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      }),
      makeContext('999')
    );
    expect(res.status).toBe(404);
  });

  it('updates goal and returns 200', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([sampleGoal]);
      return Promise.resolve([{ goal: { ...sampleGoal, title: 'Updated' }, listName: 'Work' }]);
    });

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/goals/1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.goal.title).toBe('Updated');
  });

  it('validates listId when provided', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([sampleGoal]); // existing goal
      if (callCount === 2) return Promise.resolve([]); // list not found
      return Promise.resolve([]);
    });

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/goals/1', {
        method: 'PATCH',
        body: JSON.stringify({ listId: 999 }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('List not found');
  });

  it('converts deletedAt string to Date', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve([sampleGoal]);
      return Promise.resolve([
        {
          goal: { ...sampleGoal, deletedAt: new Date('2026-03-01T00:00:00Z') },
          listName: 'Work',
        },
      ]);
    });

    const res = await PATCH(
      makeRequest('http://localhost:3000/api/goals/1', {
        method: 'PATCH',
        body: JSON.stringify({ deletedAt: '2026-03-01T00:00:00Z' }),
      }),
      makeContext('1')
    );
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/goals/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    mockDeleteWhere.mockResolvedValue(undefined);
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new Error('API key required'));
    const res = await DELETE(makeRequest('http://localhost:3000/api/goals/1'), makeContext('1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid ID', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await DELETE(makeRequest('http://localhost:3000/api/goals/abc'), makeContext('abc'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when goal not found', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([]);
    const res = await DELETE(makeRequest('http://localhost:3000/api/goals/999'), makeContext('999'));
    expect(res.status).toBe(404);
  });

  it('soft deletes a goal by default', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([sampleGoal]);

    const res = await DELETE(makeRequest('http://localhost:3000/api/goals/1'), makeContext('1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Goal deleted');
  });

  it('hard deletes a goal when permanent=true', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([sampleGoal]);

    const res = await DELETE(
      makeRequest('http://localhost:3000/api/goals/1?permanent=true'),
      makeContext('1')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Goal permanently deleted');
  });
});
