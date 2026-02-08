'use client';

import { StatusFilterEnum } from './filterStore';

// Build query string for current filter/listId (empty string if none)
export function buildFilterQuery(statusFilter: StatusFilterEnum, listId: string): string {
  const params = new URLSearchParams();
  if (listId) params.set('listId', listId);
  if (statusFilter !== StatusFilterEnum.BACKLOG) params.set('filter', statusFilter);
  return params.toString();
}

// Build href to home preserving filters
export function buildHomeHref(statusFilter: StatusFilterEnum, listId: string): string {
  const query = buildFilterQuery(statusFilter, listId);
  return '/' + (query ? `?${query}` : '');
}

// Navigate to home with given filters if needed
export function navigateHome(
  router: { push: (href: string) => void },
  pathname: string | null,
  statusFilter: StatusFilterEnum,
  listId: string
) {
  const href = buildHomeHref(statusFilter, listId);
  if (pathname !== '/' || href !== '/') router.push(href);
}
