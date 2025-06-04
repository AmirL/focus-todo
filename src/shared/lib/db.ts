import { drizzle } from 'drizzle-orm/mysql2';

// Fallback to an empty connection string during static builds
// so that importing this module doesn't throw when DATABASE_URL
// is undefined. The actual value should be provided at runtime.
export const DB = drizzle(process.env.DATABASE_URL ?? '');
