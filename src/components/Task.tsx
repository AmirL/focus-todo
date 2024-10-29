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
  const { updateTask } = useTasksStore();

  const toggleCompleted = () => {
    const completedAt = task.completedAt ? null : new Date().toISOString();
    updateTask(task.id, { completedAt });
  };

  return (
    <li key={task.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
      <div className="flex items-center space-x-2">
        <Checkbox id={`todo-${task.id}`} checked={!!task.completedAt} onCheckedChange={toggleCompleted} />
        <TaskName task={task} />
        <TaskBadges task={task} />
      </div>
      <div className="flex space-x-1">
        <StarButton task={task} />
        <SnoozeButton task={task} />
        <ReAddButton task={task} />
        <DeleteButton task={task} />
      </div>
    </li>
  );
}

export function TaskName({ task }: { task: Task }) {
  return (
    <label
      htmlFor={`todo-${task.id}`}
      className={`${task.completedAt ? 'line-through text-muted-foreground' : 'text-primary'}`}
    >
      {task.name}
    </label>
  );
}

export function TaskBadges({ task }: { task: Task }) {
  return (
    <>
      <Badge variant="secondary">{task.list}</Badge>
      {task.date && isSameDay(parseISO(task.date), new Date()) && <Badge variant="default">Today</Badge>}
      {task.date && isFuture(parseISO(task.date)) && (
        <Badge variant="outline">Snoozed: {format(parseISO(task.date), 'yyyy-MM-dd')}</Badge>
      )}
    </>
  );
}

export function ReAddButton({ task }: { task: Task }) {
  const { createTask, updateTask } = useTasksStore();

  const reAddTask = async () => {
    const newTask: Task = Object.assign(new Task(), { ...task, id: undefined, completedAt: null, date: null });
    createTask(newTask);

    updateTask(task.id, { completedAt: new Date().toISOString() });
  };
  return (
    <Button variant="ghost" size="icon" onClick={reAddTask} className="text-primary">
      <RotateCw className="h-4 w-4" />
    </Button>
  );
}

export function SnoozeButton({ task }: { task: Task }) {
  const { updateTask } = useTasksStore();

  const snoozeTodo = (date: Date) => {
    updateTask(task.id, { date: date.toISOString() });
  };

  return (
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
          onSelect={(date) => date && snoozeTodo(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function StarButton({ task }: { task: Task }) {
  const { updateTask } = useTasksStore();

  const toggleTodayTask = (task: Task) => {
    const date = dayjs(task.date).isBefore(dayjs()) ? null : new Date().toISOString();
    updateTask(task.id, { date });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleTodayTask(task)}
      className={task.date && isSameDay(parseISO(task.date), new Date()) ? 'text-yellow-500' : 'text-muted-foreground'}
    >
      <Star className="h-4 w-4" />
    </Button>
  );
}

export function DeleteButton({ task }: { task: Task }) {
  const { deleteTask } = useTasksStore();

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
