import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { Star, Users } from 'lucide-react';
import { ListsNames } from '@/entities/task/model/task';
import { IconButtonToggle } from '@/shared/ui/IconButtonToggle';
import { DatePickerButton } from './DatePickerButton';
import { SelectTaskCategory } from './SelectTaskCategory';

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '1 day' },
];

interface TaskMetadataFieldsProps {
  // Estimated Duration
  selectedDuration?: number | null;
  onDurationChange: (duration: number | null) => void;
  
  // Category/List
  selectedList: string;
  onListChange: (list: string) => void;
  
  // Toggles
  isStarred: boolean;
  onStarredChange: (starred: boolean) => void;
  isBlocker: boolean;
  onBlockerChange: (blocker: boolean) => void;
  
  // Date
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

export function TaskMetadataFields({
  selectedDuration,
  onDurationChange,
  selectedList,
  onListChange,
  isStarred,
  onStarredChange,
  isBlocker,
  onBlockerChange,
  selectedDate,
  onDateChange,
}: TaskMetadataFieldsProps) {
  const handleDurationChange = (value: string) => {
    if (value === ' ') {
      onDurationChange(null);
    } else {
      onDurationChange(parseInt(value, 10));
    }
  };

  return (
    <div className="space-y-2">
      {/* Category and Toggles Row */}
      <div className="text-sm text-muted-foreground font-medium">Category</div>
      <div className="flex items-center">
        <div className="mr-auto">
          <SelectTaskCategory selectedList={selectedList} setSelectedList={onListChange} />
        </div>

        <div className="flex items-center gap-1">
          <IconButtonToggle
            icon={(isChecked) => <Users fill={isChecked ? '#2563eb' : 'none'} className="h-4 w-4" />}
            tooltipContent="Blocker"
            isChecked={isBlocker}
            onCheckedChange={onBlockerChange}
            className={
              isBlocker ? 'text-blue-600 hover:text-blue-700' : 'text-muted-foreground hover:text-blue-600'
            }
          />
          <IconButtonToggle
            icon={(isChecked) => <Star fill={isChecked ? '#E3B644' : 'none'} className="h-4 w-4" />}
            tooltipContent="Selected"
            isChecked={isStarred}
            onCheckedChange={onStarredChange}
            className={
              isStarred
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-muted-foreground hover:text-yellow-500'
            }
          />
          <DatePickerButton selectedDate={selectedDate} onDateChange={onDateChange} />
        </div>
      </div>

      {/* Estimated Duration Row */}
      <div>
        <Label htmlFor="estimatedDuration" className="text-sm text-muted-foreground font-medium">
          Est. Duration
        </Label>
        <Select value={selectedDuration?.toString() || ''} onValueChange={handleDurationChange}>
          <SelectTrigger id="estimatedDuration" className="mt-1">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={' '}>—</SelectItem>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}