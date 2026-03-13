import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock DB
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockSet = vi.fn();
const mockUpdateWhere = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
    update: () => ({ set: mockSet }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockSet.mockReturnValue({ where: mockUpdateWhere });

// Mock api-auth
vi.mock('@/app/api/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/api/api-auth')>();
  return { ...actual, getUserIdFromApiKey: vi.fn() };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Map()),
}));

import { getUserIdFromApiKey, ApiAuthError } from '@/app/api/api-auth';
import { GET, PATCH } from './route';

const mockedGetUserId = vi.mocked(getUserIdFromApiKey);

function makeRequest(url: string, options?: { method?: string; body?: string }): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), options);
}

const USER_ID = 'user-123';

function makeContext(date: string) {
  return { params: Promise.resolve({ date }) };
}

function makeInitiativeRow(overrides: Partial<{
  id: number;
  userId: string;
  date: Date;
  suggestedListId: number | null;
  chosenListId: number | null;
  reason: string | null;
  setAt: Date;
  changedAt: Date | null;
}> = {}) {
  return {
    id: overrides.id ?? 1,
    userId: overrides.userId ?? USER_ID,
    date: overrides.date ?? new Date('2026-03-08'),
    suggestedListId: overrides.suggestedListId ?? 1,
    chosenListId: overrides.chosenListId ?? null,
    reason: overrides.reason ?? null,
    setAt: overrides.setAt ?? new Date(),
    changedAt: overrides.changedAt ?? null,
  };
}

function makeListRow(id: number = 1) {
  return {
    id,
    name: 'Work',
    userId: USER_ID,
    participatesInInitiative: true,
    archivedAt: null,
    description: null,
    isDefault: false,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: null,
  };
}

describe('GET /api/initiative/:date', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetUserId.mockResolvedValue(USER_ID);
  });

  it('should return 401 when API key is missing', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));

    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-08');
    const res = await GET(req, makeContext('2026-03-08'));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('API key required');
  });

  it('should return 400 for invalid date format', async () => {
    const req = makeRequest('http://localhost:3000/api/initiative/invalid');
    const res = await GET(req, makeContext('invalid'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Invalid date format');
  });

  it('should return 400 for date with wrong format (not YYYY-MM-DD)', async () => {
    const req = makeRequest('http://localhost:3000/api/initiative/03-08-2026');
    const res = await GET(req, makeContext('03-08-2026'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Invalid date format');
  });

  it('should return 400 for partial date values', async () => {
    const req = makeRequest('http://localhost:3000/api/initiative/2026-03');
    const res = await GET(req, makeContext('2026-03'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Invalid date format');
  });

  it('should return 404 when no initiative exists for the date', async () => {
    mockWhere.mockResolvedValue([]);

    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-08');
    const res = await GET(req, makeContext('2026-03-08'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toContain('No initiative found');
  });

  it('should return initiative for a valid date', async () => {
    const initiative = makeInitiativeRow({
      id: 5,
      date: new Date('2026-03-08'),
      suggestedListId: 1,
      chosenListId: 2,
      reason: 'Deadline',
    });
    mockWhere.mockResolvedValue([initiative]);

    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-08');
    const res = await GET(req, makeContext('2026-03-08'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.initiative).toBeDefined();
    expect(body.initiative.id).toBe(5);
    expect(body.initiative.date).toBe('2026-03-08');
    expect(body.initiative.suggestedListId).toBe(1);
    expect(body.initiative.chosenListId).toBe(2);
    expect(body.initiative.reason).toBe('Deadline');
  });

  it('should handle initiative with null optional fields', async () => {
    const initiative = makeInitiativeRow({
      id: 6,
      date: new Date('2026-03-07'),
      suggestedListId: 1,
      chosenListId: null,
      reason: null,
    });
    mockWhere.mockResolvedValue([initiative]);

    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-07');
    const res = await GET(req, makeContext('2026-03-07'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.initiative.chosenListId).toBeNull();
    expect(body.initiative.reason).toBeNull();
    expect(body.initiative.changedAt).toBeNull();
  });
});

describe('PATCH /api/initiative/:date', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetUserId.mockResolvedValue(USER_ID);
  });

  it('should return 401 when API key is missing', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));

    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-08', {
      method: 'PATCH',
      body: JSON.stringify({ listId: 1 }),
    });
    const res = await PATCH(req, makeContext('2026-03-08'));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('API key required');
  });

  it('should return 400 for invalid date format', async () => {
    const req = makeRequest('http://localhost:3000/api/initiative/bad-date', {
      method: 'PATCH',
      body: JSON.stringify({ listId: 1 }),
    });
    const res = await PATCH(req, makeContext('bad-date'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Invalid date format');
  });

  it('should return 400 when listId is missing', async () => {
    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-08', {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    const res = await PATCH(req, makeContext('2026-03-08'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('listId is required');
  });

  it('should return 404 when list does not belong to user', async () => {
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return []; // list not found
      return [];
    });

    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-08', {
      method: 'PATCH',
      body: JSON.stringify({ listId: 999 }),
    });
    const res = await PATCH(req, makeContext('2026-03-08'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('List not found');
  });

  it('should return 404 when no initiative exists for the date', async () => {
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [makeListRow(1)]; // list found
      if (callCount === 2) return []; // no initiative
      return [];
    });

    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-08', {
      method: 'PATCH',
      body: JSON.stringify({ listId: 1 }),
    });
    const res = await PATCH(req, makeContext('2026-03-08'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toContain('No initiative found');
  });

  it('should update initiative successfully', async () => {
    const existing = makeInitiativeRow({ id: 5, suggestedListId: 1, chosenListId: null });
    const updated = makeInitiativeRow({
      id: 5,
      suggestedListId: 1,
      chosenListId: 2,
      reason: 'Changed my mind',
      changedAt: new Date(),
    });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [makeListRow(2)]; // list verification
      if (callCount === 2) return [existing]; // find existing initiative
      if (callCount === 3) return [updated]; // fetch updated row after update
      return [];
    });

    mockUpdateWhere.mockResolvedValue(undefined);

    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-08', {
      method: 'PATCH',
      body: JSON.stringify({ listId: 2, reason: 'Changed my mind' }),
    });
    const res = await PATCH(req, makeContext('2026-03-08'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.initiative).toBeDefined();
    expect(body.initiative.id).toBe(5);
    expect(body.initiative.chosenListId).toBe(2);
  });

  it('should preserve existing reason when no reason provided', async () => {
    const existing = makeInitiativeRow({
      id: 5,
      suggestedListId: 1,
      chosenListId: null,
      reason: 'Original reason',
    });
    const updated = makeInitiativeRow({
      id: 5,
      suggestedListId: 1,
      chosenListId: 2,
      reason: 'Original reason', // preserved
      changedAt: new Date(),
    });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [makeListRow(2)];
      if (callCount === 2) return [existing];
      if (callCount === 3) return [updated];
      return [];
    });

    mockUpdateWhere.mockResolvedValue(undefined);

    const req = makeRequest('http://localhost:3000/api/initiative/2026-03-08', {
      method: 'PATCH',
      body: JSON.stringify({ listId: 2 }), // no reason
    });
    const res = await PATCH(req, makeContext('2026-03-08'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.initiative.reason).toBe('Original reason');
  });
});
