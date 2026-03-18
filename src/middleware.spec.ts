import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

function makeRequest(path: string, cookies?: Record<string, string>) {
  const req = new NextRequest(new URL(`http://localhost:3000${path}`));
  if (cookies) {
    for (const [name, value] of Object.entries(cookies)) {
      req.cookies.set(name, value);
    }
  }
  return req;
}

describe('middleware', () => {
  it('allows public route /login to pass through', () => {
    const res = middleware(makeRequest('/login'));
    // NextResponse.next() has status 200
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows public route /api/tasks to pass through', () => {
    const res = middleware(makeRequest('/api/tasks'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows public route /api/goals to pass through', () => {
    const res = middleware(makeRequest('/api/goals'));
    expect(res.status).toBe(200);
  });

  it('allows public route /api/auth to pass through', () => {
    const res = middleware(makeRequest('/api/auth/session'));
    expect(res.status).toBe(200);
  });

  it('allows public route /api/lists to pass through', () => {
    const res = middleware(makeRequest('/api/lists'));
    expect(res.status).toBe(200);
  });

  it('allows public route /api/initiative to pass through', () => {
    const res = middleware(makeRequest('/api/initiative'));
    expect(res.status).toBe(200);
  });

  it('allows static assets with /_next prefix to pass through', () => {
    const res = middleware(makeRequest('/_next/static/chunk.js'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows files with extensions to pass through', () => {
    const res = middleware(makeRequest('/icon.png'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows favicon paths to pass through', () => {
    const res = middleware(makeRequest('/favicon.ico'));
    expect(res.status).toBe(200);
  });

  it('allows authenticated request with session cookie to pass through', () => {
    const res = middleware(makeRequest('/dashboard', {
      'better-auth.session_token': 'valid-token',
    }));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows authenticated request with secure session cookie', () => {
    const res = middleware(makeRequest('/dashboard', {
      '__Secure-better-auth.session_token': 'valid-token',
    }));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects unauthenticated request to /login', () => {
    const res = middleware(makeRequest('/dashboard'));
    // Redirect responses have status 307
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login');
  });

  it('redirects unauthenticated request to protected route', () => {
    const res = middleware(makeRequest('/settings'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });
});
