import { GoalPlain } from '@/entities/goal/model/goal';
import { Task, TaskPlain } from '@/data-classes/task';
import toast from 'react-hot-toast';

async function api(endpoint: string, body: object | undefined = undefined) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  console.log('endpoint', endpoint);
  try {
    const response = await fetch(`/api/${endpoint}`, options);
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
  getGoals: async () => api('get-goals') as Promise<{ goals: GoalPlain[] }>,
  getTasks: async () => api('get-tasks') as Promise<{ tasks: TaskPlain[] }>,
  createTask: async (task: Task) => api('create-task', { task: Task.toPlain(task) }) as Promise<TaskPlain>,
  updateTask: async (id: string, task: Task) =>
    api(`update-task`, { id, task: Task.toPlain(task) }) as Promise<TaskPlain>,
};
