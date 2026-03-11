import { Check, Square, X } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface TimerBarProps {
  taskName: string;
  startTime: string;
  endTime?: string;
  duration: string;
  isRunning?: boolean;
  saveStatus?: SaveStatus;
  onStartTimeChange?: (value: string) => void;
  onStartTimeBlur?: () => void;
  onEndTimeChange?: (value: string) => void;
  onEndTimeBlur?: () => void;
  onStop?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function TimerBar({
  taskName,
  startTime,
  endTime,
  duration,
  isRunning = true,
  saveStatus = 'idle',
  onStartTimeChange,
  onStartTimeBlur,
  onEndTimeChange,
  onEndTimeBlur,
  onStop,
  onDismiss,
  className,
}: TimerBarProps) {
  return (
    <div
      data-cy="timer-bar"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'border-t border-border bg-white shadow-lg',
        'px-4 py-2',
        className
      )}
    >
      <div className="mx-auto flex items-center gap-3 max-w-screen-lg">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">{taskName}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange?.(e.target.value)}
            onBlur={() => onStartTimeBlur?.()}
            className="w-[110px] h-8 text-xs"
            data-cy="timer-start-input"
          />
          <span className="text-muted-foreground text-xs">to</span>
          {isRunning ? (
            <span className="text-sm font-medium text-green-600 w-[110px] text-center animate-pulse">
              running...
            </span>
          ) : (
            <Input
              type="time"
              value={endTime ?? ''}
              onChange={(e) => onEndTimeChange?.(e.target.value)}
              onBlur={() => onEndTimeBlur?.()}
              className="w-[110px] h-8 text-xs"
              data-cy="timer-end-input"
            />
          )}
        </div>

        <div className="flex-shrink-0 w-16 text-center" data-cy="timer-save-status">
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-0.5 text-xs text-green-600 animate-in fade-in duration-200">
              <Check size={12} />
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-600 font-medium">
              Failed
            </span>
          )}
        </div>

        <div className="flex-shrink-0 text-sm font-mono font-medium w-16 text-center" data-cy="timer-duration">
          {duration}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isRunning && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onStop}
              className="h-8 gap-1"
              data-cy="timer-stop-button"
            >
              <Square size={12} />
              Stop
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0 text-muted-foreground"
            data-cy="timer-dismiss-button"
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
