'use client';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Dialog, DialogTrigger } from '@/shared/ui/dialog';
import { useListsQuery } from '@/shared/api/lists';
import { Plus } from 'lucide-react';
import { ListFormDialog } from './ListFormDialog';
import { ListItem } from './ListItem';
import { useListForm } from '../hooks/useListForm';
import { useListActions } from '../hooks/useListActions';

export function ListManager() {
  const { data: lists = [], isLoading } = useListsQuery();
  const {
    newListName,
    setNewListName,
    isCreateDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    editingList,
    editName,
    setEditName,
    openEditDialog,
    closeEditDialog,
  } = useListForm();
  const { createList, updateList, deleteList, isCreating, isUpdating, isDeleting } = useListActions();

  const handleCreateList = async () => {
    const success = await createList(newListName);
    if (success) {
      closeCreateDialog();
    }
  };

  const handleEditList = async () => {
    if (!editingList) return;
    
    const success = await updateList(editingList.id, editName);
    if (success) {
      closeEditDialog();
    }
  };

  const handleDeleteList = async (list: { id: string }) => {
    await deleteList(list.id);
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
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => !open && closeCreateDialog()}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add List
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={!!editingList} onOpenChange={(open) => !open && closeEditDialog()}>
          <div className="space-y-2">
            {lists.map((list) => (
              <ListItem
                key={list.id}
                list={list}
                onEdit={openEditDialog}
                onDelete={handleDeleteList}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </Dialog>
      </CardContent>

      <ListFormDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => !open && closeCreateDialog()}
        title="Create New List"
        description="Enter a name for your new list"
        value={newListName}
        onValueChange={setNewListName}
        onSubmit={handleCreateList}
        onCancel={closeCreateDialog}
        submitLabel="Create List"
        isLoading={isCreating}
      />

      {editingList && (
        <ListFormDialog
          open={!!editingList}
          onOpenChange={(open) => !open && closeEditDialog()}
          title="Edit List"
          description="Change the name of your list"
          value={editName}
          onValueChange={setEditName}
          onSubmit={handleEditList}
          onCancel={closeEditDialog}
          submitLabel="Update List"
          isLoading={isUpdating}
        />
      )}
    </Card>
  );
}