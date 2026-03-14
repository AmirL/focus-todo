import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';

let _db: MySql2Database | null = null;

/** Lazily initialized database connection. Defers connection until first use
 *  to avoid import-time side effects during static builds and testing. */
export function getDB(): MySql2Database {
  if (!_db) {
    _db = drizzle(process.env.DATABASE_URL ?? '');
  }
  return _db;
}

/** @deprecated Use getDB() for lazy initialization. Kept for backward compatibility. */
export const DB = new Proxy({} as MySql2Database, {
  get(_, prop) {
    return (getDB() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
