import { useState, useEffect } from 'react';
import { plainToInstance } from 'class-transformer';
import { apiRequest } from './api';
import { Task } from './baserow-todo-list';

export function useTodos() {
  const [todos, setTodos] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleApiCall(endpoint = '', method = 'GET', body: object | undefined = undefined) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest(endpoint, method, body);
      return response;
    } catch (error) {
      console.error(`API call failed: ${error.message}`);
      setError(error.message || 'Something went wrong!');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const fetchTodos = async () => {
    const data = await handleApiCall('');
    setTodos(plainToInstance(Task, data.results as unknown[]));
  };

  const createTodo = async (todo: Task) => {
    const createdTodo = plainToInstance(Task, await handleApiCall('', 'POST', todo));
    setTodos((prevTodos) => [...prevTodos, createdTodo]);
  };

  const updateTodo = async (id: string, updates: Partial<Task>) => {
    const updatedTodo = plainToInstance(Task, await handleApiCall(`${id}/`, 'PATCH', updates));
    setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo)));
  };

  const deleteTodo = async (id: string) => {
    await handleApiCall(`${id}/`, 'DELETE');
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const updatedTodo = { ...todo, completedAt: todo.completedAt ? null : new Date().toISOString() };
    await updateTodo(id, updatedTodo);
  };

  const redoTodo = async (id: string) => {
    const todoToRedo = todos.find((todo) => todo.id === id);
    if (!todoToRedo) return;

    const newTodo = Object.assign(new Task(), {
      ...todoToRedo,
      id: undefined,
      completedAt: null,
      date: null,
    });

    await createTodo(newTodo);
  };

  const snoozeTodo = async (id: string, date: Date) => {
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) return;

    const updatedTodo = { ...todo, date: date.toISOString() };
    await updateTodo(id, updatedTodo);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return {
    todos,
    isLoading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    redoTodo,
    snoozeTodo,
  };
}
