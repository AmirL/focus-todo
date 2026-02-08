import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, gt, gte, isNull, lt, or, isNotNull } from 'drizzle-orm';
import dayjs from 'dayjs';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { getUserIdFromApiKey } from '@/app/api/api-auth';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import { serializeTask, handleApiError } from './serialize';

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

    // Helper to compute UTC day boundaries for a client-local day using dayjs
    // Convert UTC -> local by adding (-offsetMin), take startOf('day') in local,
    // then convert back to UTC by adding (+offsetMin).
    const startOfLocalDay = (base: Date) =>
      dayjs(base).add(-offsetMin, 'minute').startOf('day').add(offsetMin, 'minute').toDate();
    const nextDay = (utcStart: Date) => dayjs(utcStart).add(1, 'day').toDate();
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

    // Serialize date fields considering tzOffset so clients see the expected local times.
    const toLocal = (d: Date | null | undefined): string | null => {
      if (!d) return null;
      // Shift UTC -> client local using minutes offset, format with dayjs
      const local = dayjs(d).add(-offsetMin, 'minute');
      const time = local.format('YYYY-MM-DDTHH:mm:ss');
      // Build offset suffix from provided tz offset
      const total = -offsetMin; // invert to display conventional sign
      const sign = total >= 0 ? '+' : '-';
      const abs = Math.abs(total);
      const oh = String(Math.floor(abs / 60)).padStart(2, '0');
      const om = String(abs % 60).padStart(2, '0');
      return `${time}${sign}${oh}:${om}`;
    };

    const ensureDate = (v: unknown): Date | null => {
      if (v == null) return null;
      if (v instanceof Date) return v;
      if (typeof v === 'string') {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
      }
      return null;
    };

    const apiTasks = tasks.map((t) => {
      const { __list_deprecated: _, ...rest } = t;
      return {
        ...rest,
        date: toLocal(ensureDate(t.date)),
        completedAt: toLocal(ensureDate(t.completedAt)),
        deletedAt: toLocal(ensureDate(t.deletedAt)),
        selectedAt: toLocal(ensureDate(t.selectedAt)),
        updatedAt: toLocal(ensureDate(t.updatedAt)),
        createdAt: toLocal(ensureDate(t.createdAt)),
      };
    });

    return NextResponse.json({ tasks: apiTasks }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'GET /api/tasks');
  }
}

/**
 * POST /api/tasks - Create a new task
 *
 * Body: Task object with required fields (name, listId)
 * Returns: Created task with assigned ID
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromApiKey(req);

    const body = await req.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
    }

    if (!body.listId || typeof body.listId !== 'number') {
      return NextResponse.json({ error: 'Task listId is required (number)' }, { status: 400 });
    }

    // Remove fields that should be set server-side
    const { id: _id, userId: _userId, createdAt: _createdAt, ...taskFields } = body;

    // Parse date fields and set defaults
    const processedTask = parseDateFields(
      {
        ...taskFields,
        __list_deprecated: '',
        userId,
        updatedAt: new Date(),
      },
      TaskDateKeys
    );

    const [{ id }] = await DB.insert(tasksTable).values(processedTask).$returningId();
    const [createdTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

    return NextResponse.json({ task: serializeTask(createdTask) }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/tasks');
  }
}
