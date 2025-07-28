'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { useCreateList } from '../api/useCreateList';
import { useUpdateList } from '../api/useUpdateList';
import { useListsQuery } from '@/shared/api/lists';
import { useState, useEffect } from 'react';

interface ListFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
  listId?: string | null;
}

export function ListFormDialog({
  open,
  onOpenChange,
  onCancel,
  mode,
  listId
}: ListFormDialogProps) {
  const { createList, isCreating } = useCreateList();
  const { updateList, isUpdating } = useUpdateList();
  const { data: lists = [] } = useListsQuery();
  
  const [value, setValue] = useState('');
  
  const list = listId ? lists.find(l => l.id === listId) : null;
  const isLoading = mode === 'create' ? isCreating : isUpdating;
  
  // Set initial value when dialog opens
  useEffect(() => {
    if (open) {
      const initialValue = mode === 'edit' && list ? list.name : '';
      setValue(initialValue);
    }
  }, [open, mode, list]);

  const handleSubmit = async () => {
    let success = false;
    
    if (mode === 'create') {
      success = await createList(value);
    } else if (mode === 'edit' && listId) {
      success = await updateList(listId, value);
    }
    
    if (success) {
      setValue(''); // Reset form
      onCancel(); // Close dialog on success
    }
  };

  const handleCancel = () => {
    setValue(''); // Reset form
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      handleSubmit();
    }
  };

  const title = mode === 'create' ? 'Create New List' : 'Edit List';
  const description = mode === 'create' ? 'Enter a name for your new list' : 'Change the name of your list';
  const submitLabel = mode === 'create' ? 'Create List' : 'Update List';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="list-name">List Name</Label>
            <Input
              id="list-name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter list name"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
          >
            {isLoading ? `${submitLabel}...` : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}