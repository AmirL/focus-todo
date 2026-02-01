'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListModel } from '@/entities/list';
import { ListItem } from './ListItem';

interface SortableListItemProps {
  list: ListModel;
}

export function SortableListItem({ list }: SortableListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ListItem
        list={list}
        isDragging={isDragging}
        dragHandleRef={setActivatorNodeRef}
        dragHandleListeners={listeners}
      />
    </div>
  );
}
