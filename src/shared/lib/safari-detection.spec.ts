// @vitest-environment node
import { describe, it, expect } from 'vitest';

// In node environment, window is undefined so isSafari() should return false
describe('isSafari', () => {
  it('should return false when window is undefined (SSR/node)', async () => {
    const { isSafari } = await import('./safari-detection');
    expect(isSafari()).toBe(false);
  });
});
