import { Clock, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { formatDuration } from '@/shared/lib/format-duration';
import { DURATION_OPTIONS } from '@/shared/lib/duration-options';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';

interface EstimatedDurationSelectorProps {
  value: number | null;
  onChange: (minutes: number | null) => void;
  label?: string;
  id?: string;
  showLabel?: boolean;
  className?: string;
}


interface PopoverContentProps {
  onChange: (minutes: number | null) => void;
  value: number | null;
  onOpenChange: (open: boolean) => void;
}

const DurationPopoverContent = ({ onChange, value, onOpenChange }: PopoverContentProps) => (
  <PopoverContent
    className="w-48 p-0 z-50 relative"
    align="end"
    side="bottom"
    sideOffset={8}
    avoidCollisions={true}
    sticky="always"
  >
    <div className="relative z-50">
      <div className="p-2 border-b border-border flex justify-between items-center h-[44px]">
        <span className="text-xs font-medium text-muted-foreground">Estimated Duration</span>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(null);
              onOpenChange(false);
            }}
            className="text-muted-foreground cursor-pointer"
          >
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sm"
          onClick={() => {
            onChange(null);
            onOpenChange(false);
          }}
        >
          None
        </Button>
        {DURATION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => {
              onChange(option.value);
              onOpenChange(false);
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  </PopoverContent>
);

export function EstimatedDurationSelector({ 
  value, 
  onChange, 
  label = "Est. Duration",
  id = "estimatedDuration",
  showLabel = true,
  className
}: EstimatedDurationSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className={className}>
      {showLabel && (
        <Label htmlFor={id} className="text-sm text-muted-foreground font-medium">
          {label}
        </Label>
      )}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger 
          id={id}
          className={cn(
            'inline-flex items-center justify-between cursor-pointer bg-white border border-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            showLabel 
              ? 'w-full px-3 py-2 text-sm rounded-md h-10 mt-1' 
              : 'w-auto px-3 py-2 text-sm rounded min-w-[90px] h-10',
            value ? 'text-slate-900' : 'text-gray-400'
          )}
          style={{
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            touchAction: 'manipulation'
          }}
        >
          <div className="flex items-center">
            <Clock 
              size={16} 
              className="mr-2" 
            />
            <span>
              {value 
                ? (formatDuration(value) || 'Invalid duration')
                : showLabel 
                  ? 'Select duration' 
                  : 'Set time'
              }
            </span>
          </div>
          <ChevronDown size={16} />
        </PopoverTrigger>

        <DurationPopoverContent
          onChange={onChange}
          value={value}
          onOpenChange={setPopoverOpen}
        />
      </Popover>
    </div>
  );
}

