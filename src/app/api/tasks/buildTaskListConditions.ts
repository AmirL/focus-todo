import { eq, gt, gte, isNull, lt, or, SQL } from 'drizzle-orm';
import dayjs from 'dayjs';
import { tasksTable } from '@/shared/lib/drizzle/schema';

export interface TaskListFilterParams {
  userId: string;
  on?: string | null;
  since?: string | null;
  until?: string | null;
  listId?: string | null;
  goalId?: string | null;
  tzOffset?: string | null;
  includeDeleted?: boolean;
  includeRecentlyDeleted?: boolean;
  completed?: string | null;
}

function parseDate(v: string | null | undefined): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function buildTaskListConditions(params: TaskListFilterParams): (SQL | undefined)[] {
  const {
    userId,
    on: onParam,
    since: sinceParam,
    until: untilParam,
    listId: listIdParam,
    goalId: goalIdParam,
    tzOffset: tzOffsetParam,
    includeDeleted = false,
    includeRecentlyDeleted = false,
    completed,
  } = params;

  const conditions: (SQL | undefined)[] = [eq(tasksTable.userId, userId)];

  // Deleted filtering
  if (includeDeleted) {
    // no condition
  } else if (includeRecentlyDeleted) {
    const yesterday = dayjs().subtract(1, 'day').toDate();
    conditions.push(
      or(isNull(tasksTable.deletedAt), gt(tasksTable.deletedAt, yesterday))
    );
  } else {
    conditions.push(isNull(tasksTable.deletedAt));
  }

  // Date filters against task 'date' column
  const offsetMin = Number.isFinite(Number(tzOffsetParam)) ? Number(tzOffsetParam) : 0;

  const startOfLocalDay = (base: Date) =>
    dayjs(base).add(-offsetMin, 'minute').startOf('day').add(offsetMin, 'minute').toDate();
  const nextDay = (utcStart: Date) => dayjs(utcStart).add(1, 'day').toDate();

  if (onParam) {
    let startUtc: Date | null = null;
    if (onParam === 'today') {
      startUtc = startOfLocalDay(new Date());
    } else if (onParam === 'tomorrow') {
      const todayStart = startOfLocalDay(new Date());
      startUtc = nextDay(todayStart);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(onParam)) {
      const [y, m, d] = onParam.split('-').map((s) => Number(s));
      if (Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d)) {
        const base = new Date(Date.UTC(y, (m as number) - 1, d as number, 0, 0, 0));
        const localStart = dayjs(base)
          .add(-offsetMin, 'minute')
          .startOf('day')
          .add(offsetMin, 'minute')
          .toDate();
        startUtc = localStart;
      }
    }
    if (startUtc) {
      const endUtc = nextDay(startUtc);
      conditions.push(gte(tasksTable.date, startUtc));
      conditions.push(lt(tasksTable.date, endUtc));
    }
  } else {
    const since = parseDate(sinceParam);
    if (since) {
      conditions.push(gt(tasksTable.date, since));
    }
    const until = parseDate(untilParam);
    if (until) {
      conditions.push(lt(tasksTable.date, until));
    }
  }

  // List filter
  if (listIdParam) {
    const listId = Number(listIdParam);
    if (!Number.isNaN(listId)) {
      conditions.push(eq(tasksTable.listId, listId));
    }
  }

  // Goal filter
  if (goalIdParam) {
    const goalId = Number(goalIdParam);
    if (!Number.isNaN(goalId)) {
      conditions.push(eq(tasksTable.goalId, goalId));
    }
  }

  // Completed filter
  // MySQL zero dates (0000-00-00 00:00:00) are NOT NULL in SQL but get converted
  // to null by the mysql2 driver. Using IS NULL alone misses tasks with zero dates,
  // causing them to vanish when filtering by completed=false even though the API
  // serialises their completedAt as null. Use a date threshold to catch both cases.
  const EPOCH = new Date(0); // 1970-01-01 — any real completedAt will be after this
  if (completed === 'true') {
    conditions.push(gt(tasksTable.completedAt, EPOCH));
  } else if (completed === 'false') {
    conditions.push(
      or(isNull(tasksTable.completedAt), lt(tasksTable.completedAt, EPOCH))
    );
  }

  return conditions;
}
