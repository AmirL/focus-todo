import { and, eq, isNull, sql } from 'drizzle-orm';
import { DB } from '@/shared/lib/db';
import { listsTable, tasksTable, goalsTable } from '@/shared/lib/drizzle/schema';

/**
 * Database helper functions for user-scoped list operations
 */

/**
 * Creates a where condition for user-owned lists
 */
export function userListFilter(userId: string, listId?: number) {
  const conditions = [eq(listsTable.userId, userId)];
  if (listId !== undefined) {
    conditions.push(eq(listsTable.id, listId));
  }
  return and(...conditions);
}

/**
 * Creates a where condition for user-owned lists by name
 */
export function userListByNameFilter(userId: string, listName: string) {
  return and(
    eq(listsTable.userId, userId),
    eq(listsTable.name, listName)
  );
}

/**
 * Creates a where condition for user-owned tasks by list ID
 */
export function userTasksByListFilter(userId: string, listId: number) {
  return and(
    eq(tasksTable.userId, userId),
    eq(tasksTable.listId, listId)
  );
}

/**
 * Creates a where condition for user-owned goals by list ID
 */
export function userGoalsByListFilter(userId: string, listId: number) {
  return and(
    eq(goalsTable.userId, userId),
    eq(goalsTable.listId, listId)
  );
}

/**
 * Finds a list by ID that belongs to the user
 */
export async function findUserListById(userId: string, listId: number) {
  const [list] = await DB.select()
    .from(listsTable)
    .where(userListFilter(userId, listId));
  
  return list || null;
}

/**
 * Finds a list by name that belongs to the user
 */
export async function findUserListByName(userId: string, listName: string): Promise<typeof listsTable.$inferSelect | null> {
  const [list] = await DB.select()
    .from(listsTable)
    .where(userListByNameFilter(userId, listName));

  return list || null;
}

/**
 * Gets lists for a user, ordered by sortOrder then createdAt.
 * By default excludes archived lists.
 */
export function getUserLists(userId: string, includeArchived: boolean = false) {
  const conditions = [eq(listsTable.userId, userId)];

  if (!includeArchived) {
    conditions.push(isNull(listsTable.archivedAt));
  }

  return DB.select()
    .from(listsTable)
    .where(and(...conditions))
    .orderBy(listsTable.sortOrder, listsTable.createdAt);
}

/**
 * Counts tasks and goals using a specific list
 */
export async function countListUsage(userId: string, listId: number) {
  const [tasksCountResult] = await DB.select({ count: sql<number>`count(*)` })
    .from(tasksTable)
    .where(userTasksByListFilter(userId, listId));

  const [goalsCountResult] = await DB.select({ count: sql<number>`count(*)` })
    .from(goalsTable)
    .where(userGoalsByListFilter(userId, listId));

  return {
    tasksCount: Number(tasksCountResult?.count) || 0,
    goalsCount: Number(goalsCountResult?.count) || 0
  };
}

/**
 * Creates default lists for a new user
 */
export function createDefaultLists(userId: string) {
  const defaultLists = [
    { name: 'Work', userId, isDefault: true, sortOrder: 0, color: 'blue' },
    { name: 'Personal', userId, isDefault: true, sortOrder: 1, color: 'violet' }
  ];

  return DB.insert(listsTable).values(defaultLists);
}

/**
 * Updates tasks and goals to use a new list name
 */
export async function reassignItemsToList(
  userId: string,
  fromListId: number,
  toListId: number
) {
  await DB.update(tasksTable)
    .set({ listId: toListId })
    .where(userTasksByListFilter(userId, fromListId));

  await DB.update(goalsTable)
    .set({ listId: toListId })
    .where(userGoalsByListFilter(userId, fromListId));
}

/**
 * Deletes a user's list
 */
export function deleteUserList(userId: string, listId: number) {
  return DB.delete(listsTable)
    .where(userListFilter(userId, listId));
}

/**
 * Sets the archived status of a list
 */
export function setListArchivedStatus(userId: string, listId: number, archived: boolean) {
  return DB.update(listsTable)
    .set({
      archivedAt: archived ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(userListFilter(userId, listId));
}