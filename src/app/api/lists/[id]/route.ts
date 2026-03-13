import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { listsTable } from '@/shared/lib/drizzle/schema';
import { authenticateApiKey } from '@/app/api/api-auth';
import { serializeList, handleApiError } from '../serialize';
import {
  findUserListById,
  findUserListByName,
  countListUsage,
  reassignItemsToList,
  deleteUserList,
  setListArchivedStatus,
  userListFilter,
} from '@/shared/lib/db/list-queries';
import { validateListColor } from '@/shared/lib/colors';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/lists/:id - Get a single list
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await authenticateApiKey(req);
    const { id } = await context.params;
    const listId = parseInt(id, 10);

    if (isNaN(listId)) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const list = await findUserListById(userId, listId);

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json({ list: serializeList(list) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'GET /api/lists/:id');
  }
}

/**
 * PATCH /api/lists/:id - Update a list
 *
 * Body: { name?: string, description?: string, participatesInInitiative?: boolean, archived?: boolean }
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const userId = await authenticateApiKey(req);
    const { id } = await context.params;
    const listId = parseInt(id, 10);

    if (isNaN(listId)) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const existing = await findUserListById(userId, listId);
    if (!existing) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const body = await req.json();

    // Handle archive toggle
    if ('archived' in body) {
      if (typeof body.archived !== 'boolean') {
        return NextResponse.json({ error: 'archived must be a boolean' }, { status: 400 });
      }

      await setListArchivedStatus(userId, listId, body.archived);

      const [updated] = await DB.select()
        .from(listsTable)
        .where(eq(listsTable.id, listId));

      return NextResponse.json({ list: serializeList(updated) }, { status: 200 });
    }

    // Handle regular update
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json({ error: 'List name is required' }, { status: 400 });
      }
      if (body.name.trim().length > 255) {
        return NextResponse.json({ error: 'List name must be 255 characters or less' }, { status: 400 });
      }

      // Check for duplicate name
      const duplicate = await findUserListByName(userId, body.name.trim());
      if (duplicate && duplicate.id !== listId) {
        return NextResponse.json({ error: 'A list with this name already exists' }, { status: 409 });
      }

      updateData.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.color !== undefined) {
      const colorValidation = validateListColor(body.color);
      if (!colorValidation.isValid) {
        return NextResponse.json({ error: colorValidation.error }, { status: 400 });
      }
      updateData.color = body.color;
    }

    if (body.participatesInInitiative !== undefined) {
      updateData.participatesInInitiative = Boolean(body.participatesInInitiative);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    await DB.update(listsTable)
      .set(updateData)
      .where(userListFilter(userId, listId));

    const [updated] = await DB.select()
      .from(listsTable)
      .where(eq(listsTable.id, listId));

    return NextResponse.json({ list: serializeList(updated) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'PATCH /api/lists/:id');
  }
}

/**
 * DELETE /api/lists/:id - Delete a list
 *
 * Query params:
 *   - reassignTo: List ID to reassign tasks/goals to before deletion
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const userId = await authenticateApiKey(req);
    const { id } = await context.params;
    const listId = parseInt(id, 10);

    if (isNaN(listId)) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const existing = await findUserListById(userId, listId);
    if (!existing) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const { tasksCount, goalsCount } = await countListUsage(userId, listId);

    const { searchParams } = new URL(req.url);
    const reassignToParam = searchParams.get('reassignTo');

    if ((tasksCount > 0 || goalsCount > 0) && !reassignToParam) {
      return NextResponse.json(
        {
          error: 'Cannot delete list with existing tasks or goals. Use ?reassignTo=<listId> to reassign them.',
          tasksCount,
          goalsCount,
        },
        { status: 400 }
      );
    }

    if (reassignToParam) {
      const targetId = parseInt(reassignToParam, 10);
      if (isNaN(targetId)) {
        return NextResponse.json({ error: 'Invalid reassignTo list ID' }, { status: 400 });
      }

      const targetList = await findUserListById(userId, targetId);
      if (!targetList) {
        return NextResponse.json({ error: 'Target list for reassignment not found' }, { status: 404 });
      }

      await reassignItemsToList(userId, listId, targetId);
    }

    await deleteUserList(userId, listId);

    return NextResponse.json({ message: 'List deleted successfully' }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'DELETE /api/lists/:id');
  }
}
