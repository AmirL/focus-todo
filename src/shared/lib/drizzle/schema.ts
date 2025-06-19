import { sql } from 'drizzle-orm';
import { mysqlTable, int, varchar, text, date, boolean, tinyint, timestamp, datetime } from 'drizzle-orm/mysql-core';

export const tasksTable = mysqlTable('tasks', {
  id: int('id').autoincrement().primaryKey().notNull(),
  name: varchar('name', { length: 300 }).notNull(),
  details: text('details'),
  date: datetime('date'),
  estimatedDuration: int('estimated_duration'),
  completedAt: datetime('completed_at'),
  list: varchar('list', { length: 255 }).notNull(),
  isBlocker: boolean('is_blocker').default(false),
  selectedAt: date('selected_at'),
  uid: int('uid'),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  deletedAt: datetime('deleted_at'),
  updatedAt: datetime('updated_at'),
  createdAt: datetime('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const goalsTable = mysqlTable('goals', {
  id: int('id').autoincrement().primaryKey().notNull(),
  title: varchar('title', { length: 255 }),
  progress: tinyint('progress').default(0),
  list: varchar('list', { length: 255 }),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  deletedAt: date('deleted_at'),
});

// BetterAuth tables
export const user = mysqlTable("user", {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
  role: text('role').default("user")
});

export const session = mysqlTable("session", {
  id: varchar('id', { length: 36 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 36 }).notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = mysqlTable("account", {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: varchar('user_id', { length: 36 }).notNull().references(()=> user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = mysqlTable("verification", {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date())
});
