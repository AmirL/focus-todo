import { mysqlTable, int, varchar, text, date, boolean } from 'drizzle-orm/mysql-core';

export const tasksTable = mysqlTable('tasks', {
  id: int('id').autoincrement().primaryKey().notNull(),
  name: varchar('name', { length: 300 }).notNull(),
  details: text('details'),
  date: date('date'),
  completedAt: date('completed_at'),
  list: varchar('list', { length: 255 }).notNull(),
  selectedAt: date('selected_at'),
  uid: int('uid'),
  deletedAt: date('deleted_at'),
});
