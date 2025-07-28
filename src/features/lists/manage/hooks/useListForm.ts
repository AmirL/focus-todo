import { useState } from 'react';
import { ListModel } from '@/entities/list';

export function useListForm() {
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<ListModel | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const openCreateDialog = () => {
    setNewListName('');
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setNewListName('');
    setIsCreateDialogOpen(false);
  };

  const openEditDialog = (list: ListModel) => {
    setEditingList(list);
    setEditName(list.name);
  };

  const closeEditDialog = () => {
    setEditingList(null);
    setEditName('');
  };

  return {
    // Create dialog state
    newListName,
    setNewListName,
    isCreateDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    
    // Edit dialog state
    editingList,
    editName,
    setEditName,
    openEditDialog,
    closeEditDialog,
  };
}