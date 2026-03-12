'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { LIST_COLORS, type ListColor, getColorClasses, COLOR_DISPLAY_NAMES } from '@/shared/lib/colors';
import { cn } from '@/shared/lib/utils';

interface ColorPickerProps {
  value: ListColor | null;
  onChange: (color: ListColor | null) => void;
  className?: string;
}

function ColorSwatch({ color, className, ...props }: { color: string; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const classes = getColorClasses(color);
  return (
    <span
      className={cn('inline-block h-3.5 w-3.5 rounded-full flex-shrink-0', classes.swatch, className)}
      {...props}
    />
  );
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => onChange(v as ListColor)}
    >
      <SelectTrigger data-cy="color-picker" className={cn('w-full', className)}>
        <SelectValue placeholder="Select a color">
          {value ? (
            <span className="flex items-center gap-2">
              <ColorSwatch color={value} />
              <span>{COLOR_DISPLAY_NAMES[value]}</span>
            </span>
          ) : (
            'Select a color'
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LIST_COLORS.map((color) => (
          <SelectItem key={color} value={color} data-cy={`color-option-${color}`}>
            <span className="flex items-center gap-2">
              <ColorSwatch color={color} />
              <span>{COLOR_DISPLAY_NAMES[color]}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { ColorSwatch };
