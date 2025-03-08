import { Star } from 'lucide-react';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';

interface StarCheckboxProps {
  isStarred: boolean;
  setIsStarred: (checked: boolean) => void;
}

export function StarCheckbox({ isStarred, setIsStarred }: StarCheckboxProps) {
  return (
    <div className="flex items-center gap-2 pt-6">
      <Checkbox id="starred" checked={isStarred} onCheckedChange={(checked) => setIsStarred(!!checked)} />
      <label htmlFor="starred" className="text-sm font-medium leading-none cursor-pointer flex items-center">
        <Star className="h-4 w-4 mr-1" />
        <span>Star</span>
      </label>
    </div>
  );
}
