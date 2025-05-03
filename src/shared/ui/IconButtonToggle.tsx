import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';

interface IconButtonToggleProps {
  icon: (isChecked: boolean) => React.ReactNode;
  tooltipContent: string;
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function IconButtonToggle({
  icon,
  tooltipContent,
  isChecked,
  onCheckedChange,
  className,
}: IconButtonToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCheckedChange(!isChecked)}
            className={cn(
              'h-8 w-8', // Smaller size
              className
            )}
          >
            {icon(isChecked)}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
