import { Star } from 'lucide-react';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';

interface StarCheckboxProps {
  isStarred: boolean;
  setIsStarred: (checked: boolean) => void;
}

export function StarCheckbox({ isStarred, setIsStarred }: StarCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="starred" checked={isStarred} onCheckedChange={(checked) => setIsStarred(checked as boolean)} />
      <Label
        htmlFor="starred"
        className="text-sm font-medium leading-none cursor-pointer select-none flex items-center"
      >
        <Star className="w-4 h-4 mr-1" />
      </Label>
    </div>
  );
}
