'use client';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useListsQuery, useReorderListsMutation } from '@/shared/api/lists';
import { Plus } from 'lucide-react';
import { ListFormDialog } from './ListFormDialog';
import { SortableListItem } from './SortableListItem';
import { ListItem } from './ListItem';
import { useState } from 'react';
import { ListModel } from '@/entities/list';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

export function ListManager() {
  const { data: lists = [], isLoading } = useListsQuery({ includeArchived: true });
  const reorderMutation = useReorderListsMutation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeList, setActiveList] = useState<ListModel | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const listId = active.id as string;
    const list = lists.find((l) => l.id === listId);
    if (list) {
      setActiveList(list);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveList(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeListId = active.id as string;
    const overListId = over.id as string;

    const oldIndex = lists.findIndex((list) => list.id === activeListId);
    const newIndex = lists.findIndex((list) => list.id === overListId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reorderedLists = arrayMove(lists, oldIndex, newIndex);
    const reorderedListIds = reorderedLists.map((list) => list.id);

    reorderMutation.mutate(reorderedListIds);
  };

  if (isLoading) {
    return <div>Loading lists...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Lists</CardTitle>
            <CardDescription>
              Create, edit, and delete your custom lists
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add List
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lists.map((list) => list.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {lists.map((list) => (
                <SortableListItem key={list.id} list={list} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeList ? (
              <div className="bg-white border border-border rounded-lg shadow-lg opacity-80">
                <ListItem list={activeList} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>

      <ListFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCancel={() => setCreateDialogOpen(false)}
        mode="create"
      />
    </Card>
  );
}
