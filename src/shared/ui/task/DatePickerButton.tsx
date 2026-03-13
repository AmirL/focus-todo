'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Clock, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar as CalendarComponent } from '@/shared/ui/calendar';
import dayjs from 'dayjs';
import { isSafari as checkIsSafari } from '@/shared/lib/safari-detection';

interface DatePickerButtonProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

export function DatePickerButton({ selectedDate, onDateChange }: DatePickerButtonProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);

  useEffect(() => {
    setIsSafariBrowser(checkIsSafari());
  }, []);

  const handleCalendarOpenChange = (open: boolean) => {
    setCalendarOpen(open);
  };

  const onDateSelect = (date: Date | undefined) => {
    onDateChange(date ?? null);
    setCalendarOpen(false);
  };

  const clearDate = () => {
    onDateChange(null);
    setCalendarOpen(false);
  };

  const getDateButtonLabel = () => {
    if (!selectedDate) return 'Set Date';
    if (dayjs(selectedDate).isSame(dayjs(), 'day')) return 'Today';
    if (dayjs(selectedDate).isSame(dayjs().add(1, 'day'), 'day')) return 'Tomorrow';
    return dayjs(selectedDate).format('MMM D');
  };

  return (
    <Popover 
      open={calendarOpen} 
      onOpenChange={handleCalendarOpenChange}
      modal={!isSafariBrowser} // Disable modal mode for Safari to fix dialog focus issues
    >
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex h-10 items-center gap-2 px-3 text-sm"
          style={{
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            touchAction: 'manipulation'
          }}
        >
          <Clock className="h-4 w-4" />
          {getDateButtonLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 z-50 relative" 
        align="end"
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
        sticky="always"
      >
        <div
          className="relative z-50"
          style={{
            pointerEvents: 'auto',
            position: 'relative',
            touchAction: 'manipulation',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            // Safari-specific focus fixes
            ...(isSafariBrowser && {
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)',
              isolation: 'isolate',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            })
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="p-2 border-b border-border flex justify-end h-[44px]">
            {selectedDate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearDate();
                }} 
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearDate();
                }}
                className="text-muted-foreground cursor-pointer"
              >
                <X className="h-4 w-4 mr-1" /> Clear Date
              </Button>
            )}
          </div>
          <CalendarComponent 
            mode="single" 
            selected={selectedDate ?? undefined} 
            onSelect={onDateSelect} 
            initialFocus={!isSafariBrowser} // Disable initialFocus for Safari to prevent focus conflicts
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
