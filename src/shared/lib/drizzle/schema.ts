import { sql } from 'drizzle-orm';
import { mysqlTable, int, varchar, text, date, boolean, tinyint, timestamp, datetime, json } from 'drizzle-orm/mysql-core';
import type { AiSuggestions } from '@/shared/types/aiSuggestions';

export const tasksTable = mysqlTable('tasks', {
  id: int('id').autoincrement().primaryKey().notNull(),
  name: varchar('name', { length: 300 }).notNull(),
  details: text('details'),
  date: datetime('date'),
  estimatedDuration: int('estimated_duration'),
  completedAt: datetime('completed_at'),
  __list_deprecated: varchar('__list_deprecated', { length: 255 }).notNull().default(''),
  listId: int('list_id').notNull().references(() => listsTable.id, { onDelete: 'restrict' }),
  isBlocker: boolean('is_blocker').default(false),
  selectedAt: date('selected_at'),
  uid: int('uid'),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  deletedAt: datetime('deleted_at'),
  updatedAt: datetime('updated_at'),
  createdAt: datetime('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  sortOrder: int('sort_order').default(0),
  aiSuggestions: json('ai_suggestions').$type<AiSuggestions>(),
});

export const goalsTable = mysqlTable('goals', {
  id: int('id').autoincrement().primaryKey().notNull(),
  title: varchar('title', { length: 255 }),
  progress: tinyint('progress').default(0),
  __list_deprecated: varchar('__list_deprecated', { length: 255 }),
  listId: int('list_id').notNull().references(() => listsTable.id, { onDelete: 'restrict' }),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  deletedAt: datetime('deleted_at'),
});

export const listsTable = mysqlTable('lists', {
  id: int('id').autoincrement().primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  isDefault: boolean('is_default').default(false),
  participatesInInitiative: boolean('participates_in_initiative').default(true),
  sortOrder: int('sort_order').default(0),
  createdAt: datetime('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime('updated_at')
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
  archivedAt: datetime('archived_at'),
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

// API Keys for programmatic access
export const apiKeysTable = mysqlTable('api_keys', {
  id: int('id').autoincrement().primaryKey().notNull(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }),
  // Store only a secure hash of the key; never the plaintext
  hashedKey: varchar('hashed_key', { length: 128 }).notNull(),
  // First few chars of the plaintext key for display/debug
  prefix: varchar('prefix', { length: 16 }).notNull(),
  // Last 4 chars for display so users can identify keys
  lastFour: varchar('last_four', { length: 4 }).notNull(),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastUsedAt: datetime('last_used_at'),
  revokedAt: datetime('revoked_at'),
});

// Goal Milestones - progress log entries for goals
export const goalMilestonesTable = mysqlTable('goal_milestones', {
  id: int('id').autoincrement().primaryKey().notNull(),
  goalId: int('goal_id').notNull().references(() => goalsTable.id, { onDelete: 'cascade' }),
  progress: tinyint('progress').notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  createdAt: datetime('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Current Initiative - daily focus rotation between lists
export const currentInitiativeTable = mysqlTable('current_initiatives', {
  id: int('id').autoincrement().primaryKey().notNull(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  suggestedListId: int('suggested_list_id').references(() => listsTable.id, { onDelete: 'set null' }),
  chosenListId: int('chosen_list_id').references(() => listsTable.id, { onDelete: 'set null' }),
  reason: varchar('reason', { length: 500 }),
  setAt: datetime('set_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  changedAt: datetime('changed_at'),
});
