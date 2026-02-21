import { describe, it, expect } from 'vitest';
import { StatusFilterEnum } from './filterStore';
import { buildFilterQuery, buildHomeHref, navigateHome } from './filterUrl';

describe('buildFilterQuery', () => {
  it('should return empty string for default filter and no listId', () => {
    expect(buildFilterQuery(StatusFilterEnum.BACKLOG, '')).toBe('');
  });

  it('should include filter param when not BACKLOG', () => {
    const query = buildFilterQuery(StatusFilterEnum.FUTURE, '');
    expect(query).toBe('filter=future');
  });

  it('should include listId param when set', () => {
    const query = buildFilterQuery(StatusFilterEnum.BACKLOG, '2');
    expect(query).toBe('listId=2');
  });

  it('should include both filter and listId when both set', () => {
    const query = buildFilterQuery(StatusFilterEnum.TODAY, '1');
    expect(query).toContain('listId=1');
    expect(query).toContain('filter=today');
  });

  it('should not include filter param for BACKLOG even with listId', () => {
    const query = buildFilterQuery(StatusFilterEnum.BACKLOG, '3');
    expect(query).toBe('listId=3');
    expect(query).not.toContain('filter=');
  });

  it('should handle SELECTED filter', () => {
    const query = buildFilterQuery(StatusFilterEnum.SELECTED, '');
    expect(query).toBe('filter=selected');
  });

  it('should handle TOMORROW filter', () => {
    const query = buildFilterQuery(StatusFilterEnum.TOMORROW, '');
    expect(query).toBe('filter=tomorrow');
  });
});

describe('buildHomeHref', () => {
  it('should return "/" for default filter and no listId', () => {
    expect(buildHomeHref(StatusFilterEnum.BACKLOG, '')).toBe('/');
  });

  it('should include query string when filter is set', () => {
    expect(buildHomeHref(StatusFilterEnum.FUTURE, '')).toBe('/?filter=future');
  });

  it('should include query string when listId is set', () => {
    expect(buildHomeHref(StatusFilterEnum.BACKLOG, '2')).toBe('/?listId=2');
  });

  it('should include both params in query string', () => {
    const href = buildHomeHref(StatusFilterEnum.TODAY, '1');
    expect(href).toMatch(/^\/\?/);
    expect(href).toContain('listId=1');
    expect(href).toContain('filter=today');
  });
});

describe('navigateHome', () => {
  it('should call router.push when not on home page', () => {
    const router = { push: vi.fn() };
    navigateHome(router, '/settings', StatusFilterEnum.BACKLOG, '');
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('should call router.push when on home page but with filters', () => {
    const router = { push: vi.fn() };
    navigateHome(router, '/', StatusFilterEnum.FUTURE, '');
    expect(router.push).toHaveBeenCalledWith('/?filter=future');
  });

  it('should not call router.push when already on home with no filters', () => {
    const router = { push: vi.fn() };
    navigateHome(router, '/', StatusFilterEnum.BACKLOG, '');
    expect(router.push).not.toHaveBeenCalled();
  });

  it('should navigate with listId filter', () => {
    const router = { push: vi.fn() };
    navigateHome(router, '/other', StatusFilterEnum.BACKLOG, '2');
    expect(router.push).toHaveBeenCalledWith('/?listId=2');
  });

  it('should navigate from a non-root path with combined filters', () => {
    const router = { push: vi.fn() };
    navigateHome(router, '/tasks', StatusFilterEnum.TODAY, '1');
    const call = router.push.mock.calls[0][0] as string;
    expect(call).toContain('filter=today');
    expect(call).toContain('listId=1');
  });
});
