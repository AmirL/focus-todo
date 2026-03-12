'use client';

import { Button } from '@/shared/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shared/ui/alert-dialog';
import { ListModel } from '@/entities/list';
import { ColorSwatch } from '@/shared/ui/color-picker';
import { Edit, Trash2, GripVertical, Archive, ArchiveRestore } from 'lucide-react';
import { useDeleteList } from '../api/useDeleteList';
import { useArchiveList } from '../api/useArchiveList';
import { ListFormDialog } from './ListFormDialog';
import { useState } from 'react';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface ListItemProps {
  list: ListModel;
  isDragging?: boolean;
  dragHandleRef?: (element: HTMLElement | null) => void;
  dragHandleListeners?: SyntheticListenerMap;
}

export function ListItem({ list, isDragging, dragHandleRef, dragHandleListeners }: ListItemProps) {
  const { deleteList, isDeleting } = useDeleteList();
  const { archiveList, unarchiveList, isArchiving } = useArchiveList();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteList(list.id);
  };

  const handleArchiveToggle = async () => {
    if (list.isArchived) {
      await unarchiveList(list.id);
    } else {
      await archiveList(list.id);
    }
  };

  return (
    <div data-cy={`list-item-${list.name.toLowerCase().replace(/\s+/g, '-')}`} className={`flex items-center justify-between p-3 border rounded-lg ${isDragging ? 'opacity-50' : ''} ${list.isArchived ? 'opacity-60' : ''}`}>
      <div className="flex items-center space-x-2">
        {dragHandleRef && (
          <button
            ref={dragHandleRef}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...dragHandleListeners}
            aria-label="Drag to reorder list"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        {list.color && <ColorSwatch color={list.color} />}
        <span className="font-medium">{list.name}</span>
        {list.isDefault && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            Default
          </span>
        )}
        {list.isArchived && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
            Archived
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          data-cy="edit-list-btn"
          onClick={() => setEditDialogOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleArchiveToggle}
          disabled={isArchiving}
          title={list.isArchived ? 'Unarchive' : 'Archive'}
          data-testid={`archive-list-${list.id}`}
        >
          {list.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        </Button>

        {!list.isDefault && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete List</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{list.name}&quot;? This action cannot be undone.
                  Any tasks or goals in this list will need to be reassigned.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <ListFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onCancel={() => setEditDialogOpen(false)}
        mode="edit"
        listId={list.id}
      />
    </div>
  );
}
