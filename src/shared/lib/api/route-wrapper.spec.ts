import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  withAuthAndErrorHandling,
  createErrorResponse,
  createSuccessResponse,
} from './route-wrapper';

vi.mock('@/app/api/user-auth', () => ({
  validateUserSession: vi.fn(),
}));

import { validateUserSession } from '@/app/api/user-auth';

const mockedValidateUserSession = vi.mocked(validateUserSession);

describe('route-wrapper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createErrorResponse', () => {
    it('should return a JSON response with error message and default 400 status', async () => {
      const response = createErrorResponse('Something went wrong');
      const body = await response.json();

      expect(body).toEqual({ error: 'Something went wrong' });
      expect(response.status).toBe(400);
    });

    it('should use a custom status code when provided', async () => {
      const response = createErrorResponse('Not found', 404);
      const body = await response.json();

      expect(body).toEqual({ error: 'Not found' });
      expect(response.status).toBe(404);
    });

    it('should return a 422 status for validation errors', async () => {
      const response = createErrorResponse('Invalid input', 422);

      expect(response.status).toBe(422);
    });
  });

  describe('createSuccessResponse', () => {
    it('should return a JSON response with data and default 200 status', async () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data);
      const body = await response.json();

      expect(body).toEqual(data);
      expect(response.status).toBe(200);
    });

    it('should use a custom status code when provided', async () => {
      const data = { id: 1 };
      const response = createSuccessResponse(data, 201);
      const body = await response.json();

      expect(body).toEqual(data);
      expect(response.status).toBe(201);
    });

    it('should handle an array as response data', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createSuccessResponse(data);
      const body = await response.json();

      expect(body).toEqual(data);
      expect(response.status).toBe(200);
    });

    it('should handle an empty object', async () => {
      const response = createSuccessResponse({});
      const body = await response.json();

      expect(body).toEqual({});
    });

    it('should handle null data', async () => {
      const response = createSuccessResponse(null);
      const body = await response.json();

      expect(body).toBeNull();
    });
  });

  describe('withAuthAndErrorHandling', () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/test');

    it('should call the handler with the request and session when authenticated', async () => {
      const mockSession = { user: { id: 'user-123' } };
      mockedValidateUserSession.mockResolvedValue(mockSession as never);

      const handler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const wrappedHandler = withAuthAndErrorHandling(handler, 'test-route');
      const response = await wrappedHandler(mockRequest);
      const body = await response.json();

      expect(handler).toHaveBeenCalledWith(mockRequest, mockSession);
      expect(body).toEqual({ success: true });
    });

    it('should return 500 with error message when validateUserSession throws', async () => {
      mockedValidateUserSession.mockRejectedValue(new Error('No session found'));

      const handler = vi.fn();

      const wrappedHandler = withAuthAndErrorHandling(handler, 'test-route');
      const response = await wrappedHandler(mockRequest);
      const body = await response.json();

      expect(handler).not.toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(body).toEqual({ error: 'No session found' });
    });

    it('should return "Unknown error occurred" for non-Error thrown values', async () => {
      mockedValidateUserSession.mockRejectedValue('some string error');

      const handler = vi.fn();

      const wrappedHandler = withAuthAndErrorHandling(handler, 'test-route');
      const response = await wrappedHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: 'Unknown error occurred' });
    });

    it('should return 500 when the handler itself throws an error', async () => {
      const mockSession = { user: { id: 'user-123' } };
      mockedValidateUserSession.mockResolvedValue(mockSession as never);

      const handler = vi.fn().mockRejectedValue(new Error('Handler failed'));

      const wrappedHandler = withAuthAndErrorHandling(handler, 'handler-error-route');
      const response = await wrappedHandler(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: 'Handler failed' });
    });

    it('should log the error with the route name', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Auth error');
      mockedValidateUserSession.mockRejectedValue(error);

      const handler = vi.fn();

      const wrappedHandler = withAuthAndErrorHandling(handler, 'my-route');
      await wrappedHandler(mockRequest);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in my-route:', error);
    });

    it('should return the handler response as-is on success', async () => {
      const mockSession = { user: { id: 'user-456' } };
      mockedValidateUserSession.mockResolvedValue(mockSession as never);

      const expectedResponse = NextResponse.json({ tasks: [] }, { status: 200 });
      const handler = vi.fn().mockResolvedValue(expectedResponse);

      const wrappedHandler = withAuthAndErrorHandling(handler, 'tasks-route');
      const response = await wrappedHandler(mockRequest);

      expect(response).toBe(expectedResponse);
    });
  });
});
