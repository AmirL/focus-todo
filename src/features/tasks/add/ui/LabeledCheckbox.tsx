import { Checkbox } from '@/shared/ui/checkbox';
import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';

type Props = {
  id: string;
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  label: ReactNode;
  tooltipContent: string;
  iconOnly?: boolean;
};

export function LabeledCheckbox({ id, isChecked, setIsChecked, label, tooltipContent, iconOnly = false }: Props) {
  const content = (
    <div className="flex items-center space-x-1.5">
      <div className="flex items-center justify-center h-8">
        <Checkbox
          id={id}
          checked={isChecked}
          onCheckedChange={(checked) => setIsChecked(!!checked)}
          className="h-4 w-4"
        />
      </div>

      {!iconOnly && (
        <label htmlFor={id} className="text-sm font-medium leading-none cursor-pointer flex items-center">
          {label}
        </label>
      )}

      {iconOnly && (
        <label htmlFor={id} className="cursor-pointer flex items-center justify-center h-full">
          {label}
        </label>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="flex h-8 items-center">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
