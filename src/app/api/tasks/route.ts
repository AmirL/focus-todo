import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import dayjs from 'dayjs';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys, parseBool, clamp, formatTimezoneOffset } from '@/shared/lib/utils';
import { withApiAuth } from '@/shared/lib/api/api-route-wrapper';
import { serializeTask } from './serialize';
import { buildTaskListConditions } from './buildTaskListConditions';

const ALLOWED_PARAMS: Record<string, string> = {
  on: 'Filter by day: "today", "tomorrow", or "YYYY-MM-DD"',
  since: 'Tasks with date >= value (ISO date string)',
  until: 'Tasks with date < value (ISO date string)',
  listId: 'Filter by list ID (number)',
  goalId: 'Filter by goal ID (number)',
  completed: 'Filter by completion: "true" or "false"',
  includeDeleted: 'Include deleted tasks: "true" or "false"',
  includeRecentlyDeleted: 'Include tasks deleted in last 24h: "true" or "false"',
  tzOffset: 'Timezone offset from UTC in minutes, e.g. -180 for UTC+3 (default: -180)',
  limit: 'Max results 1-500 (default: 100)',
  apiKey: 'API key (prefer Authorization header instead)',
};

async function getHandler(req: NextRequest, userId: string) {
  const { searchParams } = new URL(req.url);

  // Validate query parameters
  const unknownParams = [...searchParams.keys()].filter((k) => !(k in ALLOWED_PARAMS));
  if (unknownParams.length > 0) {
    return NextResponse.json(
      {
        error: `Unknown query parameter(s): ${unknownParams.join(', ')}`,
        allowedParameters: ALLOWED_PARAMS,
      },
      { status: 400 }
    );
  }

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
  const offsetMin = Number.isFinite(Number(tzOffsetParam)) ? Number(tzOffsetParam) : -180;

  const tasks = await DB.select()
    .from(tasksTable)
    .where(and(...conditions))
    .limit(limit);

  // Serialize date fields considering tzOffset so clients see the expected local times.
  const offsetSuffix = formatTimezoneOffset(-offsetMin);
  const toLocal = (d: Date | null | undefined): string | null => {
    if (!d) return null;
    const local = dayjs(d).add(-offsetMin, 'minute');
    return `${local.format('YYYY-MM-DDTHH:mm:ss')}${offsetSuffix}`;
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
}

/**
 * POST /api/tasks - Create a new task
 *
 * Body: Task object with required fields (name, listId)
 * Returns: Created task with assigned ID
 */
async function postHandler(req: NextRequest, userId: string) {
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
}

export const GET = withApiAuth(getHandler, 'GET /api/tasks');
export const POST = withApiAuth(postHandler, 'POST /api/tasks');
