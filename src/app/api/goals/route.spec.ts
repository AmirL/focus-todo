import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock DB
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLeftJoin = vi.fn();
const mockValues = vi.fn();
const mock$returningId = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
    insert: () => ({ values: mockValues }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
mockLeftJoin.mockReturnValue({ where: mockWhere });
mockValues.mockReturnValue({ $returningId: mock$returningId });

// Mock auth
vi.mock('@/app/api/api-auth', () => ({
  getUserIdFromApiKey: vi.fn(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

import { GET, POST } from './route';
import { getUserIdFromApiKey } from '@/app/api/api-auth';

const mockedGetUserId = vi.mocked(getUserIdFromApiKey);

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as never);
}

const sampleGoalRow = {
  goal: {
    id: 1,
    title: 'Test Goal',
    description: 'desc',
    progress: 50,
    listId: 1,
    userId: 'user-1',
    deletedAt: null,
    __list_deprecated: '',
  },
  listName: 'Work',
};

describe('GET /api/goals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockLeftJoin.mockReturnValue({ where: mockWhere });
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new Error('API key required'));
    const res = await GET(makeRequest('http://localhost:3000/api/goals'));
    expect(res.status).toBe(401);
  });

  it('returns goals list', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([sampleGoalRow]);

    const res = await GET(makeRequest('http://localhost:3000/api/goals'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.goals).toHaveLength(1);
    expect(body.goals[0].title).toBe('Test Goal');
    expect(body.goals[0].listName).toBe('Work');
    expect(body.goals[0]).not.toHaveProperty('__list_deprecated');
  });

  it('returns empty array when no goals', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([]);

    const res = await GET(makeRequest('http://localhost:3000/api/goals'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.goals).toEqual([]);
  });

  it('supports listId filter parameter', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([sampleGoalRow]);

    const res = await GET(makeRequest('http://localhost:3000/api/goals?listId=1'));
    expect(res.status).toBe(200);
  });

  it('supports includeDeleted parameter', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockWhere.mockResolvedValue([]);

    const res = await GET(makeRequest('http://localhost:3000/api/goals?includeDeleted=true'));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/goals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockLeftJoin.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ $returningId: mock$returningId });
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new Error('API key required'));
    const res = await POST(
      makeRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify({ title: 'Goal', listId: 1 }),
      })
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when title is missing', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify({ listId: 1 }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Goal title is required');
  });

  it('returns 400 when title is empty', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify({ title: '  ', listId: 1 }),
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when listId is missing', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify({ title: 'Goal' }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Goal listId is required (number)');
  });

  it('returns 404 when list does not exist', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    // First DB.select for list verification returns empty
    mockWhere.mockResolvedValueOnce([]);

    const res = await POST(
      makeRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify({ title: 'Goal', listId: 999 }),
      })
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('List not found');
  });

  it('creates a goal and returns 201', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    // First call: list verification
    mockWhere.mockResolvedValueOnce([{ id: 1, name: 'Work', userId: 'user-1' }]);
    mock$returningId.mockResolvedValue([{ id: 10 }]);
    // Second call: fetch created goal
    mockWhere.mockResolvedValueOnce([
      {
        goal: {
          id: 10,
          title: 'New Goal',
          description: null,
          progress: 0,
          listId: 1,
          userId: 'user-1',
          deletedAt: null,
          __list_deprecated: '',
        },
        listName: 'Work',
      },
    ]);

    const res = await POST(
      makeRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Goal', listId: 1 }),
      })
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.goal.id).toBe(10);
    expect(body.goal.title).toBe('New Goal');
    expect(body.goal.listName).toBe('Work');
  });
});
