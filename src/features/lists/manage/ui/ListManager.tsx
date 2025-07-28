'use client';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useListsQuery } from '@/shared/api/lists';
import { Plus } from 'lucide-react';
import { ListFormDialog } from './ListFormDialog';
import { ListItem } from './ListItem';
import { useState } from 'react';

export function ListManager() {
  const { data: lists = [], isLoading } = useListsQuery();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
        <div className="space-y-2">
          {lists.map((list) => (
            <ListItem
              key={list.id}
              list={list}
            />
          ))}
        </div>
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