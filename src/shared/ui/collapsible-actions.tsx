import { ReactNode } from 'react';
import { Button } from '@/shared/ui/button';
import { MoreHorizontal, LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useCollapsible } from '@/shared/hooks/useCollapsible';

interface CollapsibleActionsProps {
  children: ReactNode;
  /** Show actions on desktop hover */
  showOnHover?: boolean;
  /** Custom trigger icon */
  triggerIcon?: LucideIcon;
  /** Custom trigger button className */
  triggerClassName?: string;
  /** Custom expanded content className */
  expandedClassName?: string;
  /** Animation duration class */
  animationClass?: string;
}

export function CollapsibleActions({
  children,
  showOnHover = true,
  triggerIcon: TriggerIcon = MoreHorizontal,
  triggerClassName,
  expandedClassName,
  animationClass = 'animate-in slide-in-from-right-2 duration-300 ease-out',
}: CollapsibleActionsProps) {
  const { isExpanded, containerRef, toggle } = useCollapsible();

  return (
    <div className="flex items-center">
      {/* Desktop: Show actions on hover (optional) */}
      {showOnHover && (
        <div className="hidden sm:flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {children}
        </div>
      )}
      
      {/* Mobile: Collapsible actions */}
      <div className="sm:hidden" ref={containerRef}>
        {!isExpanded ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className={cn(
              'h-8 w-8 text-muted-foreground hover:text-foreground',
              triggerClassName
            )}
          >
            <TriggerIcon className="h-4 w-4" />
          </Button>
        ) : (
          <div className={cn('flex space-x-1', animationClass, expandedClassName)}>
            {children}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className={cn(
                'h-8 w-8 text-muted-foreground hover:text-foreground bg-background/80',
                triggerClassName
              )}
            >
              <TriggerIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}