"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Star, Clock, RotateCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, isFuture, isSameDay, parseISO } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Expose, plainToInstance, instanceToPlain, Transform } from 'class-transformer';
import dayjs from "dayjs"


const BASEROW_TOKEN = "ZOlzdEhtUxCeeCcBaM0wMZjMuqDuHbZM"
const TABLE_ID = 379718
const API_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/`



export const FIELDS = {
  name: 'field_2869962',
  details: 'field_2869964',
  date: 'field_2869965',
  completed_at: 'field_2872650',
  list: 'field_2872651',
};


export class Todo {
  @Expose()
  id!: number;

  @Expose({ name: 'field_2869962' })
  name!: string;
  // name!: string;

  @Expose({ name: 'field_2869964' })
  details!: string;
  // details!: string;

  @Expose({ name: 'field_2869965' })
  @Transform(({ value }) => (value ? dayjs(value).format('YYYY-MM-DD') : null), { toPlainOnly: true })
  date?: string | null;
  // date!: string;

  @Expose({ name: 'field_2872650' })
  @Transform(({ value }) => value ? dayjs(value).format('YYYY-MM-DD') : null, { toPlainOnly: true })
  completedAt?: string | null;
  // completedAt!: string | null;

  @Expose({ name: 'field_2872651' })
  list!: string;
  // list!: string;
}

const lists = [
  "Work",
  "Personal" ,
  "Other" ,
];

export function BaserowTodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [selectedList, setSelectedList] = useState("Personal")
  const [filter, setFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTodos(plainToInstance(Todo, data.results as unknown[]));
      console.log(data.results);
      console.log(plainToInstance(Todo, data.results as unknown[]));
    } catch (error) {
      console.error("Error fetching todos:", error)
      setError("Failed to fetch todos. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const apiCreateTodo = async (todo: Todo) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BASEROW_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instanceToPlain(todo)),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = plainToInstance(Todo, await response.json());
    setTodos(prevTodos => {
      // TODO: Fix it - when add multiple items need to update id for all of them
      console.log('prevTodos', prevTodos)
      const lastItem = prevTodos.at(-1);
      // if (!lastItem) return;
      lastItem!.id = data.id
      return prevTodos;
    })
  }

  const addTodo = async () => {
    if (newTodo.trim() !== "") {
      setIsLoading(true)
      setError(null)
      try {
        const todoTexts = newTodo.split('\n').filter(text => text.trim() !== "")
        const newTodoItems = todoTexts.map(text => {
          const todo = new Todo()
          todo.name = text;
          todo.list = selectedList;
          return todo;
        })
        setTodos([...todos, ...newTodoItems])
        for(const todo of newTodoItems) {
          await apiCreateTodo(todo);
        }
        setNewTodo("")
      } catch (error) {
        // TODO: Remove last item in case of error
        console.error("Error adding todo:", error)
        setError("Failed to add todo. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    setIsLoading(true)
    setError(null)
    try {
      console.log(instanceToPlain(updates));
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instanceToPlain(updates)),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const updatedTodo = plainToInstance(Todo, await response.json());
      setTodos(prevTodos => prevTodos.map(todo => todo.id === id ? updatedTodo : todo))
    } catch (error) {
      console.error("Error updating todo:", error)
      setError("Failed to update todo. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTodo = (id: number) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      todo.completedAt = todo.completedAt ? null : new Date().toISOString();
      updateTodo(id, todo)
    }
  }

  const deleteTodo = async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${BASEROW_TOKEN}`,
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error deleting todo:", error)
      setError("Failed to delete todo. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const redoTodo = async (id: number) => {
    const todoToRedo = todos.find(todo => todo.id === id)
    if (todoToRedo) {
      const newTodo: Todo = Object.assign(new Todo(), {...todoToRedo, id: undefined, completedAt: null, date: null});
      todoToRedo.completedAt = new Date().toISOString();
      setTodos(prevTodos => [...prevTodos, newTodo])
      updateTodo(id, todoToRedo);
      apiCreateTodo(newTodo);
    }
  }

  const toggleTodayTask = (id: number) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      todo.date = dayjs(todo.date).isBefore(dayjs()) ? null : new Date().toISOString();
      updateTodo(id, todo)
    }
  }

  const snoozeTodo = (id: number, date: Date) => {
    const todo = todos.find(todo => todo.id === id)
    if (todo) {
      todo.date = date.toISOString();
      updateTodo(id, todo)
    }
  }

  const filteredTodos = todos.filter(todo => {
    const today = new Date()
    if (filter === "All") return !todo.date || !isFuture(parseISO(todo.date))
    if (filter === "Today") return todo.date && isSameDay(parseISO(todo.date), today)
    if (filter === "Future") return todo.date && isFuture(parseISO(todo.date))
    return todo.list === filter && (!todo.date || !isFuture(parseISO(todo.date)))
  })


  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4 text-primary">Baserow Todo List</h1>
      <div className="space-y-2 mb-4">
        <Textarea
          placeholder="Add a new task"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex space-x-2">
          <Select value={selectedList} onValueChange={setSelectedList}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a list" />
            </SelectTrigger>
            <SelectContent>
              {lists.map(list => (
                <SelectItem key={list} value={list}>{list}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addTodo} className="flex-grow">Add Task</Button>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant={filter === "All" ? "default" : "outline"} onClick={() => setFilter("All")}>All</Button>
        <Button variant={filter === "Today" ? "default" : "outline"} onClick={() => setFilter("Today")}>Today</Button>
        <Button variant={filter === "Future" ? "default" : "outline"} onClick={() => setFilter("Future")}>Future</Button>
        {lists.map(list => (
          <Button key={list} variant={filter === list ? "default" : "outline"} onClick={() => setFilter(list)}>{list}</Button>
        ))}
      </div>
      {/* {isLoading && <div className="flex justify-center items-center h-5">Loading...</div>} */}
      {filteredTodos.length === 0 ? (
        isLoading ? <div className="flex justify-center items-center h-5">Loading...</div> :
        <p className="text-center text-muted-foreground">No tasks found.</p>
      ) : (
        <ul className="space-y-2">
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={!!todo.completedAt}
                  onCheckedChange={() => toggleTodo(todo.id)}
                />
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={`${
                    todo.completedAt ? "line-through text-muted-foreground" : "text-primary"
                  }`}
                >
                  {todo.name}
                </label>
                <Badge variant="secondary">{todo.list}</Badge>
                {todo.date && isSameDay(parseISO(todo.date), new Date()) && <Badge variant="default">Today</Badge>}
                {todo.date && isFuture(parseISO(todo.date)) && <Badge variant="outline">Snoozed: {format(parseISO(todo.date), 'yyyy-MM-dd')}</Badge>}
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleTodayTask(todo.id)}
                  className={todo.date && isSameDay(parseISO(todo.date), new Date()) ? "text-yellow-500" : "text-muted-foreground"}
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
                      selected={todo.date ? parseISO(todo.date) : undefined}
                      onSelect={(date) => date && snoozeTodo(todo.id, date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => redoTodo(todo.id)}
                  className="text-primary"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}