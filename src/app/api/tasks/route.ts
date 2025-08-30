import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, gt, isNull, lt, or, isNotNull } from 'drizzle-orm';
import dayjs from 'dayjs';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { getUserIdFromApiKey } from '@/app/api/api-auth';

function parseBool(v: string | null, def = false) {
  if (v == null) return def;
  return v === '1' || v.toLowerCase() === 'true';
}

function parseDate(v: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: NextRequest) {
  try {
    // Accept API key via Authorization/X-Api-Key only (no session fallback)
    const userId = await getUserIdFromApiKey(req);

    const { searchParams } = new URL(req.url);
    // Date filters by task "date" field (not updatedAt)
    const onParam = searchParams.get('on'); // YYYY-MM-DD | today | tomorrow
    const sinceParam = searchParams.get('since'); // ISO date string, filters by date >= since
    const untilParam = searchParams.get('until'); // ISO date string, filters by date < until
    const listIdParam = searchParams.get('listId'); // number
    const includeDeleted = parseBool(searchParams.get('includeDeleted'), false);
    const includeRecentlyDeleted = parseBool(searchParams.get('includeRecentlyDeleted'), false);
    const completed = searchParams.get('completed'); // true|false
    const limitParam = searchParams.get('limit');

    const conditions = [eq(tasksTable.userId, userId)];

    // Deleted filtering
    if (includeDeleted) {
      // no condition
    } else if (includeRecentlyDeleted) {
      const yesterday = dayjs().subtract(1, 'day').toDate();
      const notDeletedOrRecent = or(
        isNull(tasksTable.deletedAt),
        gt(tasksTable.deletedAt, yesterday)
      );
      if (notDeletedOrRecent) {
        conditions.push(notDeletedOrRecent);
      }
    } else {
      conditions.push(isNull(tasksTable.deletedAt));
    }

    // Date filters against task 'date' column
    if (onParam) {
      // Support 'today'/'tomorrow' shortcuts or YYYY-MM-DD (ISO date)
      let start: Date | null = null;
      if (onParam === 'today') {
        start = dayjs().startOf('day').toDate();
      } else if (onParam === 'tomorrow') {
        start = dayjs().add(1, 'day').startOf('day').toDate();
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(onParam)) {
        const parsed = dayjs(onParam);
        if (parsed.isValid()) start = parsed.startOf('day').toDate();
      }
      if (start) {
        const end = dayjs(start).add(1, 'day').toDate();
        conditions.push(gt(tasksTable.date, start));
        conditions.push(lt(tasksTable.date, end));
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

    // Completed filter
    if (completed === 'true') {
      conditions.push(isNotNull(tasksTable.completedAt));
    } else if (completed === 'false') {
      conditions.push(isNull(tasksTable.completedAt));
    }

    // Limit
    const limit = clamp(Number(limitParam || 100), 1, 500);

    const tasks = await DB.select()
      .from(tasksTable)
      .where(and(...conditions))
      .limit(limit);

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error occurred';
    const lower = msg.toLowerCase();
    const isAuth = lower.includes('api key required') || lower.includes('invalid or revoked api key');
    const status = isAuth ? 401 : 500;
    if (!isAuth) {
      console.error('Error in GET /api/tasks:', error);
    }
    return NextResponse.json({ error: msg }, { status });
  }
}
