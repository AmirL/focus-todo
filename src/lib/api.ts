import { Task, TaskPlain } from '@/data-classes/task';
import toast from 'react-hot-toast';

async function proxy(endpoint: string, body: object | undefined = undefined) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  try {
    const response = await fetch(`/api/proxy/${endpoint}`, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(`API request failed: ${error.message ?? ''}`);
      console.error(`API request failed: ${error.message ?? ''}`);
    }
    throw error;
  }
}

export const API = {
  getTasks: async () => proxy('get-tasks') as Promise<{ tasks: TaskPlain[] }>,
  createTask: async (task: Task) => proxy('create-task', { task: Task.toPlain(task) }) as Promise<TaskPlain>,
  updateTask: async (id: string, task: Task) =>
    proxy(`update-task`, { id, task: Task.toPlain(task) }) as Promise<TaskPlain>,
};
