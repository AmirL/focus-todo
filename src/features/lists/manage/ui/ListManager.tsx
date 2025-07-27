'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shared/ui/alert-dialog';
import { useListsQuery, useCreateListMutation, useUpdateListMutation, useDeleteListMutation } from '@/shared/api/lists';
import { ListModel } from '@/entities/list';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function ListManager() {
  const { data: lists = [], isLoading } = useListsQuery();
  const createListMutation = useCreateListMutation();
  const updateListMutation = useUpdateListMutation();
  const deleteListMutation = useDeleteListMutation();

  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<ListModel | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    try {
      await createListMutation.mutateAsync(newListName.trim());
      setNewListName('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditList = async () => {
    if (!editingList || !editName.trim()) return;
    
    try {
      await updateListMutation.mutateAsync({
        id: editingList.id,
        name: editName.trim()
      });
      setEditingList(null);
      setEditName('');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteList = async (list: ListModel) => {
    try {
      // For now, we'll just delete without reassignment
      // In a more complete implementation, we'd ask the user which list to reassign to
      await deleteListMutation.mutateAsync({ id: list.id });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const openEditDialog = (list: ListModel) => {
    setEditingList(list);
    setEditName(list.name);
  };

  const closeEditDialog = () => {
    setEditingList(null);
    setEditName('');
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
                <DialogDescription>
                  Enter a name for your new list
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateList();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewListName('');
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || createListMutation.isPending}
                >
                  {createListMutation.isPending ? 'Creating...' : 'Create List'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lists.map((list) => (
            <div
              key={list.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{list.name}</span>
                {list.isDefault && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Dialog open={editingList?.id === list.id} onOpenChange={(open) => !open && closeEditDialog()}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(list)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit List</DialogTitle>
                      <DialogDescription>
                        Change the name of your list
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-list-name">List Name</Label>
                        <Input
                          id="edit-list-name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Enter list name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditList();
                            }
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={closeEditDialog}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditList}
                        disabled={!editName.trim() || updateListMutation.isPending}
                      >
                        {updateListMutation.isPending ? 'Updating...' : 'Update List'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

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
                          onClick={() => handleDeleteList(list)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleteListMutation.isPending}
                        >
                          {deleteListMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}