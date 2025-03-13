import { Checkbox } from '@/shared/ui/checkbox';
import { ReactNode } from 'react';

type Props = {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  label: ReactNode;
};

export function LabeledCheckbox({ isChecked, setIsChecked, label }: Props) {
  return (
    <div className="flex items-center gap-2 pt-6">
      <Checkbox id="starred" checked={isChecked} onCheckedChange={(checked) => setIsChecked(!!checked)} />
      <label htmlFor="starred" className="text-sm font-medium leading-none cursor-pointer flex items-center">
        {label}
      </label>
    </div>
  );
}
