import type { Config } from 'drizzle-kit';

export default {
  schema: './src/shared/lib/drizzle/schema.ts',
  out: './src/shared/lib/drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
} satisfies Config;
