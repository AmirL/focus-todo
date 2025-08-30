import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, gt, gte, isNull, lt, or, isNotNull } from 'drizzle-orm';
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
    const tzOffsetParam = searchParams.get('tzOffset'); // minutes offset from UTC (e.g., -120 for UTC+2)
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
    const offsetMin = Number.isFinite(Number(tzOffsetParam)) ? Number(tzOffsetParam) : 0;

    const toUtcFromLocal = (d: Date): Date => new Date(d.getTime() - offsetMin * 60000);
    const startOfLocalDay = (base: Date) => {
      const shifted = new Date(base.getTime() + offsetMin * 60000);
      const localStart = new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate(), 0, 0, 0);
      return toUtcFromLocal(localStart);
    };
    const nextDay = (utcStart: Date) => new Date(utcStart.getTime() + 24 * 60 * 60000);
    if (onParam) {
      // Support 'today'/'tomorrow' or YYYY-MM-DD in the caller's local timezone defined by tzOffset
      let startUtc: Date | null = null;
      if (onParam === 'today') {
        startUtc = startOfLocalDay(new Date());
      } else if (onParam === 'tomorrow') {
        const todayStart = startOfLocalDay(new Date());
        startUtc = nextDay(todayStart);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(onParam)) {
        const [y, m, d] = onParam.split('-').map((s) => Number(s));
        if (Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d)) {
          // Construct local midnight and convert to UTC using tzOffset
          const localStart = new Date(y, m - 1, d, 0, 0, 0);
          startUtc = toUtcFromLocal(localStart);
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
