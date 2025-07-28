'use client';

import { Button } from '@/shared/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shared/ui/alert-dialog';
import { DialogTrigger } from '@/shared/ui/dialog';
import { ListModel } from '@/entities/list';
import { Edit, Trash2 } from 'lucide-react';

interface ListItemProps {
  list: ListModel;
  onEdit: (list: ListModel) => void;
  onDelete: (list: ListModel) => void;
  isDeleting?: boolean;
}

export function ListItem({ list, onEdit, onDelete, isDeleting = false }: ListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="font-medium">{list.name}</span>
        {list.isDefault && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            Default
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(list)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>

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
                  onClick={() => onDelete(list)}
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
    </div>
  );
}