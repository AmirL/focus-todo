import { sql } from 'drizzle-orm';
import { mysqlTable, int, varchar, text, date, boolean, tinyint, timestamp, datetime } from 'drizzle-orm/mysql-core';

export const tasksTable = mysqlTable('tasks', {
  id: int('id').autoincrement().primaryKey().notNull(),
  name: varchar('name', { length: 300 }).notNull(),
  details: text('details'),
  date: date('date'),
  estimatedDuration: int('estimated_duration'),
  completedAt: datetime('completed_at'),
  list: varchar('list', { length: 255 }).notNull(),
  isBlocker: boolean('is_blocker').default(false),
  selectedAt: date('selected_at'),
  uid: int('uid'),
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
  deletedAt: date('deleted_at'),
});
