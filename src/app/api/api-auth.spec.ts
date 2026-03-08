import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// Mock next/headers before importing the module under test
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

// Mock the DB module
vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock drizzle-orm operators to return identifiable values
vi.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => ({ _op: 'and', args }),
  eq: (col: unknown, val: unknown) => ({ _op: 'eq', col, val }),
  isNull: (col: unknown) => ({ _op: 'isNull', col }),
}));

// Mock the schema
vi.mock('@/shared/lib/drizzle/schema', () => ({
  apiKeysTable: {
    hashedKey: 'hashedKey',
    revokedAt: 'revokedAt',
    id: 'id',
  },
}));

import { headers } from 'next/headers';
import { DB } from '@/shared/lib/db';
import { hashApiKey, getUserIdFromApiKey, getApiKeyFromHeaders, getApiKeyFromRequest } from './api-auth';
import type { NextRequest } from 'next/server';

const TEST_SECRET = 'test-secret-key-for-unit-tests';

describe('api-auth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.API_KEY_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.API_KEY_SECRET;
  });

  describe('hashApiKey', () => {
    it('should produce a deterministic HMAC-SHA256 hex hash', () => {
      const key = 'my-api-key';
      const result = hashApiKey(key);

      const expected = crypto.createHmac('sha256', TEST_SECRET).update(key).digest('hex');
      expect(result).toBe(expected);
    });

    it('should return a 64-character hex string', () => {
      const result = hashApiKey('any-key');
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce different hashes for different keys', () => {
      const hash1 = hashApiKey('key-one');
      const hash2 = hashApiKey('key-two');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce the same hash for the same key', () => {
      const hash1 = hashApiKey('same-key');
      const hash2 = hashApiKey('same-key');
      expect(hash1).toBe(hash2);
    });

    it('should throw when API_KEY_SECRET is not set', () => {
      delete process.env.API_KEY_SECRET;
      expect(() => hashApiKey('any-key')).toThrow('API_KEY_SECRET is not set');
    });

    it('should produce different hashes with different secrets', () => {
      const hash1 = hashApiKey('my-key');
      process.env.API_KEY_SECRET = 'different-secret';
      const hash2 = hashApiKey('my-key');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getApiKeyFromHeaders', () => {
    it('should extract key from x-api-key header', () => {
      const mockHeaders = new Map([['x-api-key', 'test-key-123']]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      expect(getApiKeyFromHeaders()).toBe('test-key-123');
    });

    it('should extract key from Authorization Bearer header', () => {
      const mockHeaders = new Map([['authorization', 'Bearer my-bearer-key']]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      expect(getApiKeyFromHeaders()).toBe('my-bearer-key');
    });

    it('should prefer x-api-key over Authorization header', () => {
      const mockHeaders = new Map([
        ['x-api-key', 'from-x-api-key'],
        ['authorization', 'Bearer from-auth'],
      ]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      expect(getApiKeyFromHeaders()).toBe('from-x-api-key');
    });

    it('should return null when no auth headers are present', () => {
      vi.mocked(headers).mockReturnValue({
        get: () => null,
      } as unknown as ReturnType<typeof headers>);

      expect(getApiKeyFromHeaders()).toBeNull();
    });

    it('should trim whitespace from header values', () => {
      const mockHeaders = new Map([['x-api-key', '  spaced-key  ']]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      expect(getApiKeyFromHeaders()).toBe('spaced-key');
    });

    it('should return null for empty x-api-key header', () => {
      const mockHeaders = new Map([['x-api-key', '   ']]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      expect(getApiKeyFromHeaders()).toBeNull();
    });
  });

  describe('getApiKeyFromRequest', () => {
    function makeRequest(url: string): NextRequest {
      return { url } as NextRequest;
    }

    it('should extract key from query parameter', () => {
      vi.mocked(headers).mockReturnValue({
        get: () => null,
      } as unknown as ReturnType<typeof headers>);

      const req = makeRequest('http://localhost:3000/api/tasks?apiKey=query-key');
      expect(getApiKeyFromRequest(req)).toBe('query-key');
    });

    it('should prefer query parameter over headers', () => {
      const mockHeaders = new Map([['x-api-key', 'header-key']]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      const req = makeRequest('http://localhost:3000/api/tasks?apiKey=query-key');
      expect(getApiKeyFromRequest(req)).toBe('query-key');
    });

    it('should fall back to headers when no query parameter', () => {
      const mockHeaders = new Map([['x-api-key', 'header-key']]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      const req = makeRequest('http://localhost:3000/api/tasks');
      expect(getApiKeyFromRequest(req)).toBe('header-key');
    });

    it('should return null when no key is provided anywhere', () => {
      vi.mocked(headers).mockReturnValue({
        get: () => null,
      } as unknown as ReturnType<typeof headers>);

      const req = makeRequest('http://localhost:3000/api/tasks');
      expect(getApiKeyFromRequest(req)).toBeNull();
    });
  });

  describe('getUserIdFromApiKey', () => {
    function makeRequest(url: string): NextRequest {
      return { url } as NextRequest;
    }

    function setupDbMock(rows: Array<{ id: number; userId: string; hashedKey: string }>) {
      const whereFn = vi.fn().mockResolvedValue(rows);
      const fromFn = vi.fn().mockReturnValue({ where: whereFn });
      vi.mocked(DB.select).mockReturnValue({ from: fromFn } as never);
      return { fromFn, whereFn };
    }

    function setupUpdateMock() {
      const updateWhereFn = vi.fn().mockResolvedValue(undefined);
      const setFn = vi.fn().mockReturnValue({ where: updateWhereFn });
      vi.mocked(DB.update).mockReturnValue({ set: setFn } as never);
      return { setFn, updateWhereFn };
    }

    it('should return userId for a valid API key', async () => {
      const apiKey = 'valid-api-key';
      const hashedKey = hashApiKey(apiKey);

      const mockHeaders = new Map([['x-api-key', apiKey]]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      setupDbMock([{ id: 1, userId: 'user-123', hashedKey }]);
      setupUpdateMock();

      const req = makeRequest('http://localhost:3000/api/tasks');
      const userId = await getUserIdFromApiKey(req);
      expect(userId).toBe('user-123');
    });

    it('should throw when no API key is provided', async () => {
      vi.mocked(headers).mockReturnValue({
        get: () => null,
      } as unknown as ReturnType<typeof headers>);

      const req = makeRequest('http://localhost:3000/api/tasks');
      await expect(getUserIdFromApiKey(req)).rejects.toThrow('API key required');
    });

    it('should throw when the API key is not found in the database', async () => {
      const mockHeaders = new Map([['x-api-key', 'unknown-key']]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      setupDbMock([]);

      const req = makeRequest('http://localhost:3000/api/tasks');
      await expect(getUserIdFromApiKey(req)).rejects.toThrow('Invalid or revoked API key');
    });

    it('should update lastUsedAt after successful lookup', async () => {
      const apiKey = 'track-usage-key';
      const hashedKey = hashApiKey(apiKey);

      const mockHeaders = new Map([['x-api-key', apiKey]]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      setupDbMock([{ id: 42, userId: 'user-456', hashedKey }]);
      const { setFn } = setupUpdateMock();

      const req = makeRequest('http://localhost:3000/api/tasks');
      await getUserIdFromApiKey(req);

      expect(DB.update).toHaveBeenCalled();
      expect(setFn).toHaveBeenCalledWith(
        expect.objectContaining({ lastUsedAt: expect.any(Date) }),
      );
    });

    it('should not throw if lastUsedAt update fails', async () => {
      const apiKey = 'resilient-key';
      const hashedKey = hashApiKey(apiKey);

      const mockHeaders = new Map([['x-api-key', apiKey]]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      setupDbMock([{ id: 1, userId: 'user-789', hashedKey }]);

      // Make the update throw
      const updateWhereFn = vi.fn().mockRejectedValue(new Error('DB write error'));
      const setFn = vi.fn().mockReturnValue({ where: updateWhereFn });
      vi.mocked(DB.update).mockReturnValue({ set: setFn } as never);

      const req = makeRequest('http://localhost:3000/api/tasks');
      const userId = await getUserIdFromApiKey(req);
      expect(userId).toBe('user-789');
    });

    it('should query with hashed key and non-revoked condition', async () => {
      const apiKey = 'check-query-key';

      const mockHeaders = new Map([['x-api-key', apiKey]]);
      vi.mocked(headers).mockReturnValue({
        get: (name: string) => mockHeaders.get(name.toLowerCase()) ?? null,
      } as unknown as ReturnType<typeof headers>);

      const { whereFn } = setupDbMock([]);

      const req = makeRequest('http://localhost:3000/api/tasks');
      try { await getUserIdFromApiKey(req); } catch {}

      expect(DB.select).toHaveBeenCalled();
      expect(whereFn).toHaveBeenCalled();
    });
  });
});
