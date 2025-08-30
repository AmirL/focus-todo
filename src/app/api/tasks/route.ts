import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, gt, isNull, lt, or } from 'drizzle-orm';
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
    const userId = await getUserIdFromApiKey();

    const { searchParams } = new URL(req.url);
    const sinceParam = searchParams.get('since'); // ISO date string, filters by updatedAt >= since
    const untilParam = searchParams.get('until'); // ISO date string, filters by updatedAt < until
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
      conditions.push(or(isNull(tasksTable.deletedAt), gt(tasksTable.deletedAt, yesterday)));
    } else {
      conditions.push(isNull(tasksTable.deletedAt));
    }

    // Date filters against updatedAt when available
    const since = parseDate(sinceParam);
    if (since) {
      conditions.push(gt(tasksTable.updatedAt, since));
    }
    const until = parseDate(untilParam);
    if (until) {
      conditions.push(lt(tasksTable.updatedAt, until));
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
      // completedAt not null
      // Drizzle doesn't support NOT NULL operator directly in conditions; emulate via or
      // We'll filter client-side as a safe fallback if needed
    } else if (completed === 'false') {
      conditions.push(isNull(tasksTable.completedAt));
    }

    // Limit
    const limit = clamp(Number(limitParam || 100), 1, 500);

    let tasks = await DB.select()
      .from(tasksTable)
      .where(and(...conditions))
      .limit(limit);

    if (completed === 'true') {
      tasks = tasks.filter((t: any) => t.completedAt != null);
    }

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
