import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock DB
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockValues = vi.fn();
const mock$returningId = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
    insert: () => ({ values: mockValues }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockValues.mockReturnValue({ $returningId: mock$returningId });

// Mock auth
vi.mock('@/app/api/api-auth', () => ({
  getUserIdFromApiKey: vi.fn(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Map(),
}));

// Mock list-queries
vi.mock('@/shared/lib/db/list-queries', () => ({
  getUserLists: vi.fn(),
  findUserListByName: vi.fn(),
}));

import { GET, POST } from './route';
import { getUserIdFromApiKey } from '@/app/api/api-auth';
import { getUserLists, findUserListByName } from '@/shared/lib/db/list-queries';

const mockedGetUserId = vi.mocked(getUserIdFromApiKey);
const mockedGetUserLists = vi.mocked(getUserLists);
const mockedFindUserListByName = vi.mocked(findUserListByName);

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as never);
}

const sampleList = {
  id: 1,
  name: 'Work',
  description: 'Work tasks',
  color: null as string | null,
  userId: 'user-1',
  isDefault: true,
  participatesInInitiative: true,
  sortOrder: 0,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  archivedAt: null,
};

describe('GET /api/lists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new Error('API key required'));
    const res = await GET(makeRequest('http://localhost:3000/api/lists'));
    expect(res.status).toBe(401);
  });

  it('returns lists', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedGetUserLists.mockResolvedValue([sampleList]);

    const res = await GET(makeRequest('http://localhost:3000/api/lists'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lists).toHaveLength(1);
    expect(body.lists[0].name).toBe('Work');
    expect(body.lists[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('passes includeArchived parameter', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedGetUserLists.mockResolvedValue([]);

    await GET(makeRequest('http://localhost:3000/api/lists?includeArchived=true'));
    expect(mockedGetUserLists).toHaveBeenCalledWith('user-1', true);
  });

  it('defaults includeArchived to false', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedGetUserLists.mockResolvedValue([]);

    await GET(makeRequest('http://localhost:3000/api/lists'));
    expect(mockedGetUserLists).toHaveBeenCalledWith('user-1', false);
  });
});

describe('POST /api/lists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ $returningId: mock$returningId });
  });

  it('returns 401 when no API key', async () => {
    mockedGetUserId.mockRejectedValue(new Error('API key required'));
    const res = await POST(
      makeRequest('http://localhost:3000/api/lists', {
        method: 'POST',
        body: JSON.stringify({ name: 'New List' }),
      })
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/lists', {
        method: 'POST',
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('List name is required');
  });

  it('returns 400 when name is empty', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/lists', {
        method: 'POST',
        body: JSON.stringify({ name: '  ' }),
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when name exceeds 255 characters', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    const res = await POST(
      makeRequest('http://localhost:3000/api/lists', {
        method: 'POST',
        body: JSON.stringify({ name: 'a'.repeat(256) }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('List name must be 255 characters or less');
  });

  it('returns 409 when duplicate name exists', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindUserListByName.mockResolvedValue([sampleList]);

    const res = await POST(
      makeRequest('http://localhost:3000/api/lists', {
        method: 'POST',
        body: JSON.stringify({ name: 'Work' }),
      })
    );
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe('A list with this name already exists');
  });

  it('creates a list and returns 201', async () => {
    mockedGetUserId.mockResolvedValue('user-1');
    mockedFindUserListByName.mockResolvedValue([]);
    // maxSortOrder query
    mockWhere.mockResolvedValueOnce([{ maxSortOrder: 1 }]);
    mock$returningId.mockResolvedValue([{ id: 3 }]);
    // fetch created list
    mockWhere.mockResolvedValueOnce([
      {
        ...sampleList,
        id: 3,
        name: 'New List',
        isDefault: false,
        sortOrder: 2,
      },
    ]);

    const res = await POST(
      makeRequest('http://localhost:3000/api/lists', {
        method: 'POST',
        body: JSON.stringify({ name: 'New List' }),
      })
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.list.name).toBe('New List');
    expect(body.list.id).toBe(3);
  });
});
