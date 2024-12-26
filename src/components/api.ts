import { instanceToPlain } from 'class-transformer';

export async function apiRequest(endpoint: string, method = 'GET', body: object | undefined = undefined) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint, method, body: instanceToPlain(body) }),
  };

  try {
    const response = await fetch('/api/proxy', options);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
    }
    if (method === 'DELETE') return;
    return response.json();
  } catch (error) {
    if (error instanceof Error) console.error(`API request failed: ${error.message ?? ''}`);
    throw error;
  }
}

async function proxy(endpoint: string, body: object | undefined = undefined) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(instanceToPlain(body)),
  };

  try {
    const response = await fetch(`/api/proxy/${endpoint}`, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) console.error(`API request failed: ${error.message ?? ''}`);
    throw error;
  }
}

export const API = {
  getTasks: async () => proxy('get-tasks'),
  createTask: async (task: object) => proxy('create-task', { task: instanceToPlain(task) }),
  updateTask: async (id: string, task: object) => proxy(`update-task`, { id, task: instanceToPlain(task) }),
};
