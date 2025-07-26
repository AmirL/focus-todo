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
      {/* Category Label */}
      <div className="text-sm text-muted-foreground font-medium">Category</div>
      
      {/* Responsive layout: single row on desktop, two rows on mobile */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3">
        {/* First section: Category and Duration */}
        <div className="flex items-center gap-2">
          <div className="flex-1 sm:flex-none">
            <SelectTaskCategory selectedList={selectedList} setSelectedList={onListChange} />
          </div>
          <EstimatedDurationSelector
            value={selectedDuration ?? null}
            onChange={onDurationChange}
            showLabel={false}
          />
        </div>

        {/* Second section: Action buttons */}
        <div className="flex items-center gap-1 sm:ml-auto">
          <IconButtonToggle
            icon={(isChecked) => <Users fill={isChecked ? '#2563eb' : 'none'} className="h-4 w-4" />}
            tooltipContent="Blocker"
            isChecked={isBlocker}
            onCheckedChange={onBlockerChange}
            className={
              isBlocker ? 'text-blue-600 hover:text-blue-700 p-2 sm:p-1' : 'text-muted-foreground hover:text-blue-600 p-2 sm:p-1'
            }
          />
          <IconButtonToggle
            icon={(isChecked) => <Star fill={isChecked ? '#E3B644' : 'none'} className="h-4 w-4" />}
            tooltipContent="Selected"
            isChecked={isStarred}
            onCheckedChange={onStarredChange}
            className={
              isStarred
                ? 'text-yellow-500 hover:text-yellow-600 p-2 sm:p-1'
                : 'text-muted-foreground hover:text-yellow-500 p-2 sm:p-1'
            }
          />
          <DatePickerButton selectedDate={selectedDate} onDateChange={onDateChange} />
        </div>
      </div>
    </div>
  );
}