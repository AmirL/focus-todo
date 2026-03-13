import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock DB
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: () => ({ from: mockFrom }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockWhere.mockReturnValue({ orderBy: mockOrderBy });

// Mock api-auth
vi.mock('@/app/api/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/api/api-auth')>();
  return { ...actual, authenticateApiKey: vi.fn() };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Map()),
}));

import { authenticateApiKey, ApiAuthError } from '@/app/api/api-auth';
import { GET } from './route';

const mockedGetUserId = vi.mocked(authenticateApiKey);

function makeRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

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
    date: overrides.date ?? new Date('2026-03-08'),
    suggestedListId: overrides.suggestedListId ?? 1,
    chosenListId: overrides.chosenListId ?? null,
    reason: overrides.reason ?? null,
    setAt: overrides.setAt ?? new Date(),
    changedAt: overrides.changedAt ?? null,
  };
}

function makeListRow(id: number, name: string, participates: boolean = true) {
  return {
    id,
    name,
    userId: USER_ID,
    participatesInInitiative: participates,
    archivedAt: null,
    description: null,
    isDefault: false,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: null,
  };
}

describe('GET /api/initiative/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetUserId.mockResolvedValue(USER_ID);
  });

  it('should return 401 when API key is missing', async () => {
    mockedGetUserId.mockRejectedValue(new ApiAuthError('API key required'));

    const req = makeRequest('http://localhost:3000/api/initiative/history');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('API key required');
  });

  it('should return history with default 30-day period', async () => {
    const lists = [
      makeListRow(1, 'Work'),
      makeListRow(2, 'Personal'),
    ];
    const initiatives = [
      makeInitiativeRow({ id: 1, date: new Date('2026-03-08'), suggestedListId: 1 }),
      makeInitiativeRow({ id: 2, date: new Date('2026-03-07'), suggestedListId: 2 }),
    ];

    // First call: lists query (no orderBy, so returns from mockWhere)
    // Second call: initiatives query (has orderBy)
    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        // lists query - returns from where() directly (no orderBy)
        return { where: vi.fn().mockReturnValue(lists) };
      }
      // initiatives query - returns from where() -> orderBy()
      return {
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue(initiatives),
        }),
      };
    });

    const req = makeRequest('http://localhost:3000/api/initiative/history');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.initiatives).toBeDefined();
    expect(body.initiatives).toHaveLength(2);
    expect(body.balance).toBeDefined();
    expect(body.period).toBeDefined();
    expect(body.period.days).toBe(30);
  });

  it('should respect custom days parameter', async () => {
    const lists = [makeListRow(1, 'Work')];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return { where: vi.fn().mockReturnValue(lists) };
      }
      return {
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue([]),
        }),
      };
    });

    const req = makeRequest('http://localhost:3000/api/initiative/history?days=7');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.period.days).toBe(7);
  });

  it('should ignore invalid days parameter and use default 30', async () => {
    const lists = [makeListRow(1, 'Work')];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return { where: vi.fn().mockReturnValue(lists) };
      }
      return {
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue([]),
        }),
      };
    });

    const req = makeRequest('http://localhost:3000/api/initiative/history?days=abc');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.period.days).toBe(30);
  });

  it('should cap days at 365', async () => {
    const lists = [makeListRow(1, 'Work')];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return { where: vi.fn().mockReturnValue(lists) };
      }
      return {
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue([]),
        }),
      };
    });

    const req = makeRequest('http://localhost:3000/api/initiative/history?days=500');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    // days > 365 should be ignored, default 30 is used
    expect(body.period.days).toBe(30);
  });

  it('should ignore negative days parameter', async () => {
    const lists = [makeListRow(1, 'Work')];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return { where: vi.fn().mockReturnValue(lists) };
      }
      return {
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue([]),
        }),
      };
    });

    const req = makeRequest('http://localhost:3000/api/initiative/history?days=-5');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.period.days).toBe(30);
  });

  it('should include list names in serialized initiatives', async () => {
    const lists = [
      makeListRow(1, 'Work'),
      makeListRow(2, 'Personal'),
    ];
    const initiatives = [
      makeInitiativeRow({ id: 1, date: new Date('2026-03-08'), suggestedListId: 1, chosenListId: 2 }),
    ];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return { where: vi.fn().mockReturnValue(lists) };
      }
      return {
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue(initiatives),
        }),
      };
    });

    const req = makeRequest('http://localhost:3000/api/initiative/history');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.initiatives[0].suggestedListName).toBe('Work');
    expect(body.initiatives[0].chosenListName).toBe('Personal');
    expect(body.initiatives[0].effectiveListName).toBe('Personal'); // chosen overrides suggested
  });

  it('should compute balance only for participating lists', async () => {
    const lists = [
      makeListRow(1, 'Work', true),
      makeListRow(2, 'Personal', true),
      makeListRow(3, 'Archived', false), // not participating
    ];
    const initiatives = [
      makeInitiativeRow({ id: 1, date: new Date('2026-03-08'), suggestedListId: 1 }),
      makeInitiativeRow({ id: 2, date: new Date('2026-03-07'), suggestedListId: 2 }),
    ];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return { where: vi.fn().mockReturnValue(lists) };
      }
      return {
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue(initiatives),
        }),
      };
    });

    const req = makeRequest('http://localhost:3000/api/initiative/history');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    // Balance should only have participating lists (Work and Personal)
    expect(body.balance).toHaveLength(2);
    const listIds = body.balance.map((b: { listId: number }) => b.listId);
    expect(listIds).toContain(1);
    expect(listIds).toContain(2);
    expect(listIds).not.toContain(3);
  });

  it('should return empty initiatives array when no history exists', async () => {
    const lists = [makeListRow(1, 'Work')];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return { where: vi.fn().mockReturnValue(lists) };
      }
      return {
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue([]),
        }),
      };
    });

    const req = makeRequest('http://localhost:3000/api/initiative/history');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.initiatives).toHaveLength(0);
    expect(body.balance).toHaveLength(1);
    expect(body.balance[0].count).toBe(0);
    expect(body.balance[0].lastUsedDate).toBeNull();
  });

  it('should track balance with correct last used dates', async () => {
    const lists = [
      makeListRow(1, 'Work'),
      makeListRow(2, 'Personal'),
    ];
    const initiatives = [
      makeInitiativeRow({ id: 1, date: new Date('2026-03-08'), suggestedListId: 1 }),
      makeInitiativeRow({ id: 2, date: new Date('2026-03-06'), suggestedListId: 1 }),
      makeInitiativeRow({ id: 3, date: new Date('2026-03-05'), suggestedListId: 2 }),
    ];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return { where: vi.fn().mockReturnValue(lists) };
      }
      return {
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue(initiatives),
        }),
      };
    });

    const req = makeRequest('http://localhost:3000/api/initiative/history');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    const workBalance = body.balance.find((b: { listId: number }) => b.listId === 1);
    const personalBalance = body.balance.find((b: { listId: number }) => b.listId === 2);

    expect(workBalance.count).toBe(2);
    expect(workBalance.lastUsedDate).toBe('2026-03-08');
    expect(personalBalance.count).toBe(1);
    expect(personalBalance.lastUsedDate).toBe('2026-03-05');
  });
});
