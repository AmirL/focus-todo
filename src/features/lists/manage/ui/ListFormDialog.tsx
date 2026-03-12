'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { ColorPicker } from '@/shared/ui/color-picker';
import { useCreateList } from '../api/useCreateList';
import { useUpdateList } from '../api/useUpdateList';
import { useListsQuery } from '@/shared/api/lists';
import { useState, useEffect } from 'react';
import type { ListColor } from '@/shared/lib/colors';

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
  const [description, setDescription] = useState('');
  const [participatesInInitiative, setParticipatesInInitiative] = useState(true);
  const [color, setColor] = useState<ListColor | null>(null);

  const list = listId ? lists.find(l => l.id === listId) : null;
  const isLoading = mode === 'create' ? isCreating : isUpdating;

  // Set initial values when dialog opens
  useEffect(() => {
    if (open) {
      const initialValue = mode === 'edit' && list ? list.name : '';
      const initialDescription = mode === 'edit' && list ? list.description ?? '' : '';
      const initialParticipates = mode === 'edit' && list ? list.participatesInInitiative : true;
      const initialColor = mode === 'edit' && list ? (list.color as ListColor | null) ?? null : null;
      setValue(initialValue);
      setDescription(initialDescription);
      setParticipatesInInitiative(initialParticipates);
      setColor(initialColor);
    }
  }, [open, mode, list]);

  const resetForm = () => {
    setValue('');
    setDescription('');
    setParticipatesInInitiative(true);
    setColor(null);
  };

  const handleSubmit = async () => {
    let success = false;

    if (mode === 'create') {
      success = await createList(value, participatesInInitiative, description || null, color);
    } else if (mode === 'edit' && listId) {
      success = await updateList(listId, value, participatesInInitiative, description || null, color);
    }

    if (success) {
      resetForm();
      onCancel();
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      handleSubmit();
    }
  };

  const title = mode === 'create' ? 'Create New List' : 'Edit List';
  const dialogDescription = mode === 'create' ? 'Enter a name for your new list' : 'Change the name of your list';
  const submitLabel = mode === 'create' ? 'Create List' : 'Update List';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-cy="list-form-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
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
          <div>
            <Label htmlFor="list-description">Description</Label>
            <Textarea
              id="list-description"
              data-cy="list-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context for tasks in this list..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="list-color">Color</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="participates-in-initiative"
              checked={participatesInInitiative}
              onCheckedChange={(checked) => setParticipatesInInitiative(checked === true)}
            />
            <Label
              htmlFor="participates-in-initiative"
              className="text-sm font-normal cursor-pointer"
            >
              Include in Daily Focus rotation
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" data-cy="list-form-cancel" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            data-cy="list-form-submit"
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
