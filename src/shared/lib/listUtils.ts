import { useMemo } from 'react';
import type { ListModel } from '@/entities/list';
import { useListsQuery } from '@/shared/api/lists';

export function buildListIdToNameMap(lists: ListModel[]): Map<number, string> {
  return new Map(lists.map((l) => [Number(l.id), l.name]));
}

function buildListIdToColorMap(lists: ListModel[]): Map<number, string | null> {
  return new Map(lists.map((l) => [Number(l.id), l.color ?? null]));
}

export function useListNameMap(): Map<number, string> {
  const { data: lists = [] } = useListsQuery();
  return useMemo(() => buildListIdToNameMap(lists), [lists]);
}

export function useListColorMap(): Map<number, string | null> {
  const { data: lists = [] } = useListsQuery();
  return useMemo(() => buildListIdToColorMap(lists), [lists]);
}

export function getListName(lists: ListModel[], listId: number): string {
  const list = lists.find((l) => Number(l.id) === listId);
  return list?.name ?? 'Unknown';
}
