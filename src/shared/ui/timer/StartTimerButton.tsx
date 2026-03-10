import { Play, Square } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface StartTimerButtonProps {
  isRunning?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function StartTimerButton({ isRunning = false, onClick, disabled = false, className }: StartTimerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-cy="start-timer-button"
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        'h-7 w-7 flex-shrink-0',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        isRunning
          ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
      aria-label={isRunning ? 'Stop timer' : 'Start timer'}
    >
      {isRunning ? <Square size={14} /> : <Play size={14} />}
    </button>
  );
}
