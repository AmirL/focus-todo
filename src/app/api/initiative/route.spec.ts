import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import dayjs from 'dayjs';

// Mock DB
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockReturningId = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
    insert: () => ({ values: mockValues }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockValues.mockReturnValue({ $returningId: mockReturningId });

// Mock api-auth
vi.mock('@/app/api/api-auth', () => ({
  getUserIdFromApiKey: vi.fn(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Map()),
}));

import { getUserIdFromApiKey } from '@/app/api/api-auth';
import { GET, POST } from './route';

const mockedGetUserId = vi.mocked(getUserIdFromApiKey);

function makeRequest(url: string, options?: { method?: string; body?: string }): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), options);
}

const TODAY = dayjs().format('YYYY-MM-DD');
const TOMORROW = dayjs().add(1, 'day').format('YYYY-MM-DD');
const USER_ID = 'user-123';

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
    date: overrides.date ?? new Date(TODAY),
    suggestedListId: overrides.suggestedListId ?? 1,
    chosenListId: overrides.chosenListId ?? null,
    reason: overrides.reason ?? null,
    setAt: overrides.setAt ?? new Date(),
    changedAt: overrides.changedAt ?? null,
  };
}

function makeListRow(overrides: Partial<{
  id: number;
  name: string;
  userId: string;
  participatesInInitiative: boolean;
  archivedAt: Date | null;
  description: string | null;
  isDefault: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date | null;
}> = {}) {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? 'Work',
    userId: overrides.userId ?? USER_ID,
    participatesInInitiative: overrides.participatesInInitiative ?? true,
    archivedAt: overrides.archivedAt ?? null,
    description: overrides.description ?? null,
    isDefault: overrides.isDefault ?? false,
    sortOrder: overrides.sortOrder ?? 0,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? null,
  };
}

describe('GET /api/initiative', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetUserId.mockResolvedValue(USER_ID);
  });

  it('should return 401 when API key is missing', async () => {
    mockedGetUserId.mockRejectedValue(new Error('API key required'));

    const req = makeRequest('http://localhost:3000/api/initiative');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('API key required');
  });

  it('should return today and tomorrow initiatives with balance', async () => {
    const lists = [
      makeListRow({ id: 1, name: 'Work' }),
      makeListRow({ id: 2, name: 'Personal' }),
    ];
    const todayInit = makeInitiativeRow({ id: 1, date: new Date(TODAY), suggestedListId: 1 });
    const tomorrowInit = makeInitiativeRow({ id: 2, date: new Date(TOMORROW), suggestedListId: 2 });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return lists; // lists query
      if (callCount === 2) return [todayInit, tomorrowInit]; // today+tomorrow query
      if (callCount === 3) return [todayInit]; // recent initiatives for balance
      return [];
    });

    const req = makeRequest('http://localhost:3000/api/initiative');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.today).toBeTruthy();
    expect(body.tomorrow).toBeTruthy();
    expect(body.today.date).toBe(TODAY);
    expect(body.tomorrow.date).toBe(TOMORROW);
    expect(body.balance).toBeDefined();
    expect(body.participatingLists).toBeDefined();
  });

  it('should return null for missing today/tomorrow initiatives', async () => {
    const lists = [
      makeListRow({ id: 1, name: 'Work' }),
      makeListRow({ id: 2, name: 'Personal' }),
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return lists;
      if (callCount === 2) return []; // no initiatives
      if (callCount === 3) return []; // no recent
      return [];
    });

    const req = makeRequest('http://localhost:3000/api/initiative');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.today).toBeNull();
    expect(body.tomorrow).toBeNull();
    expect(body.suggestedList).toBeDefined();
  });

  it('should suggest a list when tomorrow initiative is missing', async () => {
    const lists = [
      makeListRow({ id: 1, name: 'Work' }),
      makeListRow({ id: 2, name: 'Personal' }),
    ];
    const todayInit = makeInitiativeRow({ id: 1, date: new Date(TODAY), suggestedListId: 1 });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return lists;
      if (callCount === 2) return [todayInit]; // only today, no tomorrow
      if (callCount === 3) return [todayInit]; // recent initiatives
      return [];
    });

    const req = makeRequest('http://localhost:3000/api/initiative');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.today).toBeTruthy();
    expect(body.tomorrow).toBeNull();
    // suggestedList should be the least-recently-used list
    expect(body.suggestedList).toBeDefined();
    expect(body.suggestedList.id).toBe(2); // Personal, since Work was used today
  });

  it('should compute balance correctly across multiple initiatives', async () => {
    const lists = [
      makeListRow({ id: 1, name: 'Work' }),
      makeListRow({ id: 2, name: 'Personal' }),
    ];
    const recentInits = [
      makeInitiativeRow({ id: 1, date: new Date('2026-03-05'), suggestedListId: 1, chosenListId: null }),
      makeInitiativeRow({ id: 2, date: new Date('2026-03-06'), suggestedListId: 2, chosenListId: null }),
      makeInitiativeRow({ id: 3, date: new Date('2026-03-07'), suggestedListId: 1, chosenListId: 2 }), // changed to Personal
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return lists;
      if (callCount === 2) return []; // no today/tomorrow
      if (callCount === 3) return recentInits;
      return [];
    });

    const req = makeRequest('http://localhost:3000/api/initiative');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    const workBalance = body.balance.find((b: { listId: number }) => b.listId === 1);
    const personalBalance = body.balance.find((b: { listId: number }) => b.listId === 2);
    expect(workBalance.count).toBe(1); // only 2026-03-05
    expect(personalBalance.count).toBe(2); // 2026-03-06 + 2026-03-07 (changed)
  });

  it('should filter out archived lists from participating lists', async () => {
    const lists = [
      makeListRow({ id: 1, name: 'Work' }),
      // archivedAt is not null, but the WHERE clause filters these out at DB level.
      // In our mock, we just don't return archived lists.
    ];

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return lists;
      if (callCount === 2) return [];
      if (callCount === 3) return [];
      return [];
    });

    const req = makeRequest('http://localhost:3000/api/initiative');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.participatingLists).toHaveLength(1);
    expect(body.participatingLists[0].name).toBe('Work');
  });
});

describe('POST /api/initiative', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetUserId.mockResolvedValue(USER_ID);
  });

  it('should return 401 when API key is missing', async () => {
    mockedGetUserId.mockRejectedValue(new Error('API key required'));

    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({ listId: 1 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('API key required');
  });

  it('should return 400 when listId is missing', async () => {
    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('listId is required');
  });

  it('should return 400 for invalid date format', async () => {
    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({ listId: 1, date: 'not-a-date' }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Invalid date format');
  });

  it('should return 400 for date that is not today or tomorrow', async () => {
    const pastDate = dayjs().subtract(5, 'day').format('YYYY-MM-DD');
    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({ listId: 1, date: pastDate }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Can only set initiative for today or tomorrow');
  });

  it('should return 404 when list does not belong to user', async () => {
    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return []; // list not found
      return [];
    });

    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({ listId: 999 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('List not found');
  });

  it('should return 409 when initiative already exists for the date', async () => {
    const existingInit = makeInitiativeRow({ id: 1, date: new Date(TOMORROW) });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [makeListRow({ id: 1 })]; // list found
      if (callCount === 2) return [existingInit]; // existing initiative
      return [];
    });

    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({ listId: 1 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toContain('already exists');
  });

  it('should create initiative successfully with suggested list calculation', async () => {
    const createdRow = makeInitiativeRow({
      id: 10,
      date: new Date(TOMORROW),
      suggestedListId: 2,
      chosenListId: 1, // user chose differently from suggestion
    });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [makeListRow({ id: 1 })]; // list verification
      if (callCount === 2) return []; // no existing initiative
      if (callCount === 3) return [makeListRow({ id: 1, name: 'Work' }), makeListRow({ id: 2, name: 'Personal' })]; // all participating lists
      if (callCount === 4) return []; // recent initiatives for balance (empty, so both lists are new)
      if (callCount === 5) return [createdRow]; // fetching the created record
      return [];
    });

    mockReturningId.mockResolvedValue([{ id: 10 }]);

    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({ listId: 1, reason: 'Big deadline' }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.initiative).toBeDefined();
    expect(body.initiative.id).toBe(10);
  });

  it('should default to tomorrow when no date is provided', async () => {
    const createdRow = makeInitiativeRow({ id: 11, date: new Date(TOMORROW), suggestedListId: 1 });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [makeListRow({ id: 1 })];
      if (callCount === 2) return []; // no existing
      if (callCount === 3) return [makeListRow({ id: 1, name: 'Work' })];
      if (callCount === 4) return [];
      if (callCount === 5) return [createdRow];
      return [];
    });

    mockReturningId.mockResolvedValue([{ id: 11 }]);

    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({ listId: 1 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.initiative.date).toBe(TOMORROW);
  });

  it('should accept today as a valid date', async () => {
    const createdRow = makeInitiativeRow({ id: 12, date: new Date(TODAY), suggestedListId: 1 });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [makeListRow({ id: 1 })];
      if (callCount === 2) return [];
      if (callCount === 3) return [makeListRow({ id: 1, name: 'Work' })];
      if (callCount === 4) return [];
      if (callCount === 5) return [createdRow];
      return [];
    });

    mockReturningId.mockResolvedValue([{ id: 12 }]);

    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({ listId: 1, date: TODAY }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
  });

  it('should set chosenListId to null when user picks the suggested list', async () => {
    // When there are no recent initiatives and two lists, the suggestion algorithm
    // picks the list with the lowest ID (both never touched). If user picks that same list,
    // chosenListId should be null.
    const createdRow = makeInitiativeRow({
      id: 13,
      date: new Date(TOMORROW),
      suggestedListId: 1,
      chosenListId: null, // same as suggested
    });

    let callCount = 0;
    mockWhere.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [makeListRow({ id: 1 })]; // list verification
      if (callCount === 2) return []; // no existing
      if (callCount === 3) return [makeListRow({ id: 1, name: 'Work' }), makeListRow({ id: 2, name: 'Personal' })];
      if (callCount === 4) return []; // no recent initiatives => suggestion is list 1 (lowest ID)
      if (callCount === 5) return [createdRow];
      return [];
    });

    mockReturningId.mockResolvedValue([{ id: 13 }]);

    const req = makeRequest('http://localhost:3000/api/initiative', {
      method: 'POST',
      body: JSON.stringify({ listId: 1 }), // same as suggested
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    // The route sets chosenListId to null when listId === suggestedListId
    expect(body.initiative.chosenListId).toBeNull();
  });
});
