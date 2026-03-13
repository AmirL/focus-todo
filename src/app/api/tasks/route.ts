import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import dayjs from 'dayjs';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { getUserIdFromApiKey } from '@/app/api/api-auth';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import { serializeTask, handleApiError } from './serialize';
import { buildTaskListConditions } from './buildTaskListConditions';

function parseBool(v: string | null, def = false) {
  if (v == null) return def;
  return v === '1' || v.toLowerCase() === 'true';
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: NextRequest) {
  try {
    // Accept API key via Authorization/X-Api-Key only (no session fallback)
    const userId = await getUserIdFromApiKey(req);

    const { searchParams } = new URL(req.url);
    const tzOffsetParam = searchParams.get('tzOffset'); // minutes offset from UTC (e.g., -120 for UTC+2)
    const limitParam = searchParams.get('limit');

    const conditions = buildTaskListConditions({
      userId,
      on: searchParams.get('on'),
      since: searchParams.get('since'),
      until: searchParams.get('until'),
      listId: searchParams.get('listId'),
      goalId: searchParams.get('goalId'),
      tzOffset: tzOffsetParam,
      includeDeleted: parseBool(searchParams.get('includeDeleted'), false),
      includeRecentlyDeleted: parseBool(searchParams.get('includeRecentlyDeleted'), false),
      completed: searchParams.get('completed'),
    });

    // Limit
    const limit = clamp(Number(limitParam || 100), 1, 500);
    const offsetMin = Number.isFinite(Number(tzOffsetParam)) ? Number(tzOffsetParam) : 0;

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
    const taskWithParsedDates = parseDateFields(
      {
        ...taskFields,
        __list_deprecated: '',
        userId,
        updatedAt: new Date(),
      },
      TaskDateKeys
    );

    const [{ id }] = await DB.insert(tasksTable).values(taskWithParsedDates).$returningId();
    const [createdTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

    return NextResponse.json({ task: serializeTask(createdTask) }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/tasks');
  }
}
