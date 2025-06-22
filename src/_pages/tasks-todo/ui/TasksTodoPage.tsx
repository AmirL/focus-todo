'use client';
import { useEffect } from 'react';
import { TodoList } from './TodoList';
import { Card, CardContent } from '@/shared/ui/card';
import { useFilterStore } from '@/features/tasks/filter/model/filterStore';

export function TasksTodoPage() {
  const { initializeFromURL } = useFilterStore();

  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);

  return (
    <>
      <div className="w-full min-h-screen flex-1">
        <Card className="border-none shadow-none bg-transparent w-full">
          <CardContent className="space-y-6 px-2 sm:px-4">
            <TodoList />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
