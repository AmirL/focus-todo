import 'reflect-metadata';

import { TodoList } from '@/components/TodoList';
import Profile from '@/components/Profile';

export default function Home() {
  return (
    <>
      <div className="max-w-xl mx-auto p-4 bg-background">
        <h1 className="text-2xl font-bold mb-4 text-primary">Zero Resistance Todo List</h1>
        <nav style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Profile />
        </nav>
        <TodoList />
      </div>
    </>
  );
}
