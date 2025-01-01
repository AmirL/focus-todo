import { drizzle } from 'drizzle-orm/mysql2';
// const db = drizzle(process.env.DATABASE_URL);
export const DB = drizzle(`mysql://root:root@127.0.0.1/doable`);
