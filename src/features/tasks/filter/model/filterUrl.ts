'use client';

import { StatusFilterEnum } from './filterStore';

// Build query string for current filter/list (empty string if none)
export function buildFilterQuery(statusFilter: StatusFilterEnum, list: string): string {
  const params = new URLSearchParams();
  if (list) params.set('list', list);
  if (statusFilter !== StatusFilterEnum.BACKLOG) params.set('filter', statusFilter);
  return params.toString();
}

// Build href to home preserving filters
export function buildHomeHref(statusFilter: StatusFilterEnum, list: string): string {
  const query = buildFilterQuery(statusFilter, list);
  return '/' + (query ? `?${query}` : '');
}

// Navigate to home with given filters if needed
export function navigateHome(
  router: { push: (href: string) => void },
  pathname: string | null,
  statusFilter: StatusFilterEnum,
  list: string
) {
  const href = buildHomeHref(statusFilter, list);
  if (pathname !== '/' || href !== '/') router.push(href);
}

