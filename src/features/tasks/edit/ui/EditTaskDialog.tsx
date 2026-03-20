import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { TaskModel } from '@/entities/task/model/task';
import type { AiSuggestions } from '@/shared/types/aiSuggestions';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { hasAnySuggestions } from '@/shared/lib/aiSuggestions';
import { TaskFormFields } from '@/shared/ui/task/TaskFormFields';
import { useTaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import { ReAddButton } from '@/features/tasks/actions';
import {
  buildUpdatedTask,
  buildTaskWithClearedSuggestions,
  applySuggestion,
  rejectSuggestion,
  buildEditMetadataDefaults,
  getEditFormDefaults,
} from '../lib/editTaskUtils';

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task: TaskModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateTaskMutation = useUpdateTaskMutation();

  // Initialize state with task values
  const formDefaults = getEditFormDefaults(task);
  const [name, setName] = useState(formDefaults.name);
  const [details, setDetails] = useState(formDefaults.details);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions | null>(formDefaults.aiSuggestions);
  const { metadata, updateMetadata, resetMetadata } = useTaskMetadata(
    buildEditMetadataDefaults(task),
  );

  // Reset form values when task changes or dialog opens in controlled mode
  useEffect(() => {
    setName(task.name);
    setDetails(task.details ?? '');
    setAiSuggestions(task.aiSuggestions ?? null);
    resetMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, open]);

  const handleAcceptSuggestion = (fieldName: string) => {
    const result = applySuggestion(aiSuggestions, fieldName);
    if (result.appliedValue !== null) {
      if (fieldName === 'name') setName(result.appliedValue);
      else if (fieldName === 'details') setDetails(result.appliedValue);
    }
    if (result.appliedDuration !== null) {
      updateMetadata({ selectedDuration: result.appliedDuration });
    }
    setAiSuggestions(result.updatedSuggestions);
  };

  const handleRejectSuggestion = (fieldName: string) => {
    setAiSuggestions(rejectSuggestion(aiSuggestions, fieldName));
  };

  const handleClearSuggestions = () => {
    setAiSuggestions(null);
    updateTaskMutation.mutate(buildTaskWithClearedSuggestions(task, { name, details, metadata }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTaskMutation.mutate(buildUpdatedTask(task, { name, details, metadata, aiSuggestions }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Edit task</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4">
            <TaskFormFields
              name={name}
              onNameChange={setName}
              details={details}
              onDetailsChange={setDetails}
              metadata={metadata}
              onMetadataChange={updateMetadata}
              aiSuggestions={aiSuggestions}
              onAcceptSuggestion={handleAcceptSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
            />
          </div>
          <DialogFooter>
            <ReAddButton task={task} />
            {hasAnySuggestions(aiSuggestions) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                onClick={handleClearSuggestions}
                data-cy="clear-suggestions-button"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Clear suggestions
              </Button>
            )}
            <Button type="submit" data-cy="save-task-changes-button">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
