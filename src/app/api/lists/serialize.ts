import { listsTable } from '@/shared/lib/drizzle/schema';
import { toISOString } from '@/shared/lib/api/serialize-helpers';

export { handleApiError } from '@/shared/lib/api/serialize-helpers';

type ListRow = typeof listsTable.$inferSelect;

type ApiList = Omit<ListRow, 'createdAt' | 'updatedAt' | 'archivedAt'> & {
  createdAt: string | null;
  updatedAt: string | null;
  archivedAt: string | null;
};

export function serializeList(l: ListRow): ApiList {
  return {
    ...l,
    createdAt: toISOString(l.createdAt),
    updatedAt: toISOString(l.updatedAt),
    archivedAt: toISOString(l.archivedAt),
  };
}
