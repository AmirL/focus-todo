import { Task } from '@/classes/task';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Star, Clock, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isFuture, isSameDay, parseISO } from 'date-fns';
import dayjs from 'dayjs';
import { useTasksStore } from '@/store/tasksStore';

export function TaskRow({ task }: { task: Task }) {
  const { tasks, createTask, updateTask, deleteTask } = useTasksStore();

  const toggleCompleted = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    updateTask(id, { completedAt: new Date().toISOString() });
  };

  const reAddTask = async (id: string) => {
    const taskToRedo = tasks.find((todo) => todo.id === id);
    if (!taskToRedo) return;

    const newTask: Task = Object.assign(new Task(), { ...taskToRedo, id: undefined, completedAt: null, date: null });
    createTask(newTask);

    updateTask(id, { completedAt: new Date().toISOString() });
  };

  const toggleTodayTask = (id: string) => {
    const todo = tasks.find((t) => t.id === id);
    if (!todo) return;

    const date = dayjs(todo.date).isBefore(dayjs()) ? null : new Date().toISOString();
    updateTask(id, { date });
  };

  const snoozeTodo = (id: string, date: Date) => {
    const task = tasks.find((todo) => todo.id === id);
    if (!task) return;

    task.date = date.toISOString();
    updateTask(id, { date: date.toISOString() });
  };

  return (
    <li key={task.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`todo-${task.id}`}
          checked={!!task.completedAt}
          onCheckedChange={() => toggleCompleted(task.id)}
        />
        <label
          htmlFor={`todo-${task.id}`}
          className={`${task.completedAt ? 'line-through text-muted-foreground' : 'text-primary'}`}
        >
          {task.name}
        </label>
        <Badge variant="secondary">{task.list}</Badge>
        {task.date && isSameDay(parseISO(task.date), new Date()) && <Badge variant="default">Today</Badge>}
        {task.date && isFuture(parseISO(task.date)) && (
          <Badge variant="outline">Snoozed: {format(parseISO(task.date), 'yyyy-MM-dd')}</Badge>
        )}
      </div>
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleTodayTask(task.id)}
          className={
            task.date && isSameDay(parseISO(task.date), new Date()) ? 'text-yellow-500' : 'text-muted-foreground'
          }
        >
          <Star className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Clock className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={task.date ? parseISO(task.date) : undefined}
              onSelect={(date) => date && snoozeTodo(task.id, date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" onClick={() => reAddTask(task.id)} className="text-primary">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
