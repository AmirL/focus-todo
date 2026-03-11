import { Check, Square, Timer, X } from 'lucide-react';
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
        'fixed bottom-4 left-4 z-50 w-[300px]',
        'rounded-xl shadow-2xl border',
        isRunning
          ? 'bg-primary text-primary-foreground border-primary/30'
          : 'bg-white border-border',
        className
      )}
    >
      {/* Line 1: Task name */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <Timer size={14} className={cn('flex-shrink-0', isRunning ? 'animate-pulse' : 'text-muted-foreground')} />
        <span className="text-sm font-semibold truncate">{taskName}</span>
      </div>

      {/* Line 2: Time controls and duration */}
      <div className="flex items-center gap-1.5 px-4 py-1">
        <Input
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange?.(e.target.value)}
          onBlur={() => onStartTimeBlur?.()}
          className={cn(
            'w-[90px] h-7 text-xs font-mono px-1.5',
            isRunning && 'bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground'
          )}
          data-cy="timer-start-input"
        />
        <span className={cn('text-xs', isRunning ? 'text-primary-foreground/70' : 'text-muted-foreground')}>→</span>
        {isRunning ? (
          <span className="text-xs font-medium text-primary-foreground/80 w-[90px] text-center animate-pulse">
            ...
          </span>
        ) : (
          <Input
            type="time"
            value={endTime ?? ''}
            onChange={(e) => onEndTimeChange?.(e.target.value)}
            onBlur={() => onEndTimeBlur?.()}
            className="w-[90px] h-7 text-xs font-mono px-1.5"
            data-cy="timer-end-input"
          />
        )}
        <span
          className={cn(
            'ml-auto text-sm font-mono font-bold',
            isRunning && 'text-primary-foreground'
          )}
          data-cy="timer-duration"
        >
          {duration}
        </span>
      </div>

      {/* Line 3: Save status and action button */}
      <div className="flex items-center justify-between px-4 pt-1 pb-3">
        <div className="w-16" data-cy="timer-save-status">
          {saveStatus === 'saving' && (
            <span className={cn('text-xs', isRunning ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className={cn(
              'inline-flex items-center gap-0.5 text-xs animate-in fade-in duration-200',
              isRunning ? 'text-primary-foreground' : 'text-green-600'
            )}>
              <Check size={12} />
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-400 font-medium">
              Failed
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isRunning ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onStop}
              className="h-7 gap-1 text-xs font-semibold"
              data-cy="timer-stop-button"
            >
              <Square size={10} />
              Stop
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-7 gap-1 text-xs text-muted-foreground"
              data-cy="timer-dismiss-button"
            >
              <X size={12} />
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
