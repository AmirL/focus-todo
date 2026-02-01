import { and, eq, sql } from 'drizzle-orm';
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
 * Creates a where condition for user-owned tasks by list name
 */
export function userTasksByListFilter(userId: string, listName: string) {
  return and(
    eq(tasksTable.userId, userId),
    eq(tasksTable.list, listName)
  );
}

/**
 * Creates a where condition for user-owned goals by list name
 */
export function userGoalsByListFilter(userId: string, listName: string) {
  return and(
    eq(goalsTable.userId, userId),
    eq(goalsTable.list, listName)
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
export async function findUserListByName(userId: string, listName: string) {
  const lists = await DB.select()
    .from(listsTable)
    .where(userListByNameFilter(userId, listName));
  
  return lists;
}

/**
 * Gets all lists for a user, ordered by sortOrder then createdAt
 */
export async function getUserLists(userId: string) {
  return DB.select()
    .from(listsTable)
    .where(eq(listsTable.userId, userId))
    .orderBy(listsTable.sortOrder, listsTable.createdAt);
}

/**
 * Counts tasks and goals using a specific list
 */
export async function countListUsage(userId: string, listName: string) {
  const [tasksCountResult] = await DB.select({ count: sql<number>`count(*)` })
    .from(tasksTable)
    .where(userTasksByListFilter(userId, listName));

  const [goalsCountResult] = await DB.select({ count: sql<number>`count(*)` })
    .from(goalsTable)
    .where(userGoalsByListFilter(userId, listName));

  return {
    tasksCount: tasksCountResult?.count || 0,
    goalsCount: goalsCountResult?.count || 0
  };
}

/**
 * Creates default lists for a new user
 */
export async function createDefaultLists(userId: string) {
  const defaultLists = [
    { name: 'Work', userId, isDefault: true, sortOrder: 0 },
    { name: 'Personal', userId, isDefault: true, sortOrder: 1 }
  ];

  return DB.insert(listsTable).values(defaultLists);
}

/**
 * Updates tasks and goals to use a new list name
 */
export async function reassignItemsToNewList(
  userId: string, 
  oldListName: string, 
  newListName: string
) {
  await DB.update(tasksTable)
    .set({ list: newListName })
    .where(userTasksByListFilter(userId, oldListName));

  await DB.update(goalsTable)
    .set({ list: newListName })
    .where(userGoalsByListFilter(userId, oldListName));
}

/**
 * Deletes a user's list
 */
export async function deleteUserList(userId: string, listId: number) {
  return DB.delete(listsTable)
    .where(userListFilter(userId, listId));
}