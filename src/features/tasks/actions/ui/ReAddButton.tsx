import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { useReAddModalStore } from '../model/reAddModalStore';

export function ReAddButton({ task }: { task: TaskModel }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(task.date ?? null);
  const openReAdd = useReAddModalStore((s) => s.openWithTask);

  const chooseDateAndOpen = (date: Date | null) => {
    setSelectedDate(date);
    setPopoverOpen(false);
    openReAdd(task, date);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            data-cy={`readd-task-${task.id}`}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-none"
              onClick={() => chooseDateAndOpen(null)}
            >
              Re-add without date
            </Button>
            <div className="border-t">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(date) => date && chooseDateAndOpen(date)}
                initialFocus
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
