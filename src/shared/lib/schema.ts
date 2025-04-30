import { mysqlTable, int, varchar, text, date, boolean, tinyint } from 'drizzle-orm/mysql-core';

export const tasksTable = mysqlTable('tasks', {
  id: int('id').autoincrement().primaryKey().notNull(),
  name: varchar('name', { length: 300 }).notNull(),
  details: text('details'),
  date: date('date'),
  completedAt: date('completed_at'),
  list: varchar('list', { length: 255 }).notNull(),
  isBlocker: boolean('is_blocker').default(false),
  selectedAt: date('selected_at'),
  uid: int('uid'),
  deletedAt: date('deleted_at'),
  updatedAt: date('updated_at'),
});

export const goalsTable = mysqlTable('goals', {
  id: int('id').autoincrement().primaryKey().notNull(),
  title: varchar('title', { length: 255 }),
  progress: tinyint('progress').default(0),
  list: varchar('list', { length: 255 }),
  deletedAt: date('deleted_at'),
});
