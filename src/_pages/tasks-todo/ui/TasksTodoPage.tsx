'use client';
import Profile from '@/entities/user/ui/Profile';
import { TodoList } from './TodoList';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function TasksTodoPage() {
  const email = 'email long';
  const name = 'Amir';
  return (
    <>
      <div className="max-w-xl mx-auto p-4 bg-gradient-to-b from-background to-background/80 min-h-screen">
        <Card className="border-none shadow-lg bg-background/95 backdrop-blur">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-primary">Zero Resistance Todo List</CardTitle>
              <nav className="flex items-center gap-4">
                <Profile />
              </nav>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <TodoList />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
