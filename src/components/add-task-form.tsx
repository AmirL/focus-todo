'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ListsNames, Task } from '@/classes/task'
import { useTasksStore } from '@/store/tasksStore'
import { PlusCircle, Star } from 'lucide-react'

export function AddTaskForm() {
  const { createTask } = useTasksStore()
  const [newTodo, setNewTodo] = useState('')
  const [selectedList, setSelectedList] = useState('Personal')
  const [isStarred, setIsStarred] = useState(false)

  const addTodo = async () => {
    const todoTexts = newTodo.split('\n').filter((text) => text.trim() !== '')
    todoTexts.forEach(async (text) => {
      const newTask = Object.assign(new Task(), { 
        name: text, 
        list: selectedList,
        isStarred: isStarred
      })
      await createTask(newTask)
    })
    setNewTodo('')
    setIsStarred(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <Label htmlFor="new-task" className="text-lg font-semibold block">
          Add a New Task
        </Label>
        <Textarea
          id="new-task"
          placeholder="Enter your task here..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:w-1/3">
            <Label htmlFor="task-list" className="mb-2 block">
              Select List
            </Label>
            <Select value={selectedList} onValueChange={setSelectedList}>
              <SelectTrigger id="task-list" className="w-full">
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                {ListsNames.map((list) => (
                  <SelectItem key={list} value={list}>
                    {list}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="starred"
              checked={isStarred}
              onCheckedChange={(checked) => setIsStarred(checked as boolean)}
            />
            <Label
              htmlFor="starred"
              className="text-sm font-medium leading-none cursor-pointer select-none flex items-center"
            >
              <Star className="w-4 h-4 mr-1" />
              Starred Task
            </Label>
          </div>
        </div>
      </div>
      <Button onClick={addTodo} className="w-full">
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Task
      </Button>
    </div>
  )
}