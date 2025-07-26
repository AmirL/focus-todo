import { Star, Users } from 'lucide-react';
import { IconButtonToggle } from '@/shared/ui/IconButtonToggle';
import { DatePickerButton } from './DatePickerButton';
import { SelectTaskCategory } from './SelectTaskCategory';
import { EstimatedDurationSelector } from './EstimatedDurationSelector';


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

  return (
    <div className="space-y-2">
      {/* Category and Toggles Row */}
      <div className="text-sm text-muted-foreground font-medium">Category</div>
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <SelectTaskCategory selectedList={selectedList} setSelectedList={onListChange} />
          <EstimatedDurationSelector
            value={selectedDuration ?? null}
            onChange={onDurationChange}
            showLabel={false}
          />
        </div>

        <div className="flex items-center gap-1 ml-auto">
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
    </div>
  );
}