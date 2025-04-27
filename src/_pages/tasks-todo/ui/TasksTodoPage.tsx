'use client';
import Profile from '@/entities/user/ui/Profile';
import { TodoList } from './TodoList';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function TasksTodoPage() {
  return (
    <>
      <div className="w-full min-h-screen">
        <div className="max-w-2xl md:mx-auto">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 px-2 sm:px-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Zero Resistance Todo List</CardTitle>
                <nav className="flex items-center gap-4">
                  <Profile />
                </nav>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-2 sm:px-4">
              <TodoList />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
