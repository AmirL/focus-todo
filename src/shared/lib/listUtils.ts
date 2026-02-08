import type { ListModel } from '@/entities/list';

export function buildListIdToNameMap(lists: ListModel[]): Map<number, string> {
  return new Map(lists.map((l) => [Number(l.id), l.name]));
}

export function getListName(lists: ListModel[], listId: number): string {
  const list = lists.find((l) => Number(l.id) === listId);
  return list?.name ?? 'Unknown';
}
