import { describe, it, expect, vi } from 'vitest';
import { AuthError, ApiAuthError, handleApiError } from './auth-errors';

describe('AuthError', () => {
  it('should be an instance of Error', () => {
    const err = new AuthError('unauthorized');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AuthError);
  });

  it('should have name set to AuthError', () => {
    const err = new AuthError('test');
    expect(err.name).toBe('AuthError');
  });

  it('should preserve the message', () => {
    const err = new AuthError('session expired');
    expect(err.message).toBe('session expired');
  });
});

describe('ApiAuthError', () => {
  it('should be an instance of AuthError', () => {
    const err = new ApiAuthError('bad key');
    expect(err).toBeInstanceOf(AuthError);
    expect(err).toBeInstanceOf(ApiAuthError);
  });

  it('should have name set to ApiAuthError', () => {
    const err = new ApiAuthError('test');
    expect(err.name).toBe('ApiAuthError');
  });

  it('should be an instance of Error', () => {
    const err = new ApiAuthError('bad key');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('handleApiError', () => {
  it('should return 401 for AuthError', () => {
    const err = new AuthError('no session');
    const response = handleApiError(err, 'test-op');

    expect(response.status).toBe(401);
  });

  it('should return 401 for ApiAuthError', () => {
    const err = new ApiAuthError('invalid key');
    const response = handleApiError(err, 'test-op');

    expect(response.status).toBe(401);
  });

  it('should return 500 for regular Error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('db connection failed');
    const response = handleApiError(err, 'test-op');

    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });

  it('should return 500 for non-Error values', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = handleApiError('string error', 'test-op');

    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });

  it('should log non-auth errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('db error');
    handleApiError(err, 'my-operation');

    expect(consoleSpy).toHaveBeenCalledWith('Error in my-operation:', err);
    consoleSpy.mockRestore();
  });

  it('should not log auth errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    handleApiError(new AuthError('no session'), 'my-operation');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should include error message in JSON response for Error instances', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('something broke');
    const response = handleApiError(err, 'test-op');
    const body = await response.json();

    expect(body.error).toBe('something broke');
    consoleSpy.mockRestore();
  });

  it('should use generic message for non-Error values', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = handleApiError(42, 'test-op');
    const body = await response.json();

    expect(body.error).toBe('Unknown error occurred');
    consoleSpy.mockRestore();
  });
});
