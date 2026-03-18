import { describe, it, expect } from 'vitest';

// Test the module-level behavior: in node (no window), isSafari returns false
describe('isSafari', () => {
  it('should return false when window is undefined (SSR/node)', async () => {
    // In the default vitest node environment, window is undefined
    // so isSafari() should return false
    const { isSafari } = await import('./safari-detection');
    expect(isSafari()).toBe(false);
  });
});
