import { Button } from '@/shared/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useTaskActions } from '../hooks/useTaskActions';

interface TaskActionsProps {
  actionButtons: JSX.Element;
  deleted: boolean;
}

export function TaskActions({ actionButtons, deleted }: TaskActionsProps) {
  const { showActions, actionsRef, toggleActions } = useTaskActions();

  if (deleted) return null;

  return (
    <div className="flex items-center">
      {/* Desktop: Show actions on hover */}
      <div className="hidden sm:flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {actionButtons}
      </div>

      {/* Mobile: Collapsible actions */}
      <div className="sm:hidden" ref={actionsRef}>
        {!showActions ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleActions}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex space-x-1 animate-in slide-in-from-right-2 duration-300 ease-out">
            {actionButtons}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleActions}
              className="h-8 w-8 text-muted-foreground hover:text-foreground bg-background/80"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
