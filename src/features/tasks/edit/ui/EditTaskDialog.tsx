import { useEffect, useState } from 'react';
import { TaskModel } from '@/entities/task/model/task';
import type { AiSuggestions } from '@/shared/types/aiSuggestions';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';
import { TaskFormFields } from '@/shared/ui/task/TaskFormFields';
import { useTaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import { ReAddButton } from '@/features/tasks/actions/ui/ReAddButton';

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
  const [name, setName] = useState(task.name);
  const [details, setDetails] = useState(task.details ?? '');
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions | null>(task.aiSuggestions ?? null);
  const { metadata, updateMetadata, resetMetadata } = useTaskMetadata({
    selectedDuration: task.estimatedDuration ?? null,
    selectedList: task.list,
    isStarred: !!task.selectedAt,
    isBlocker: task.isBlocker,
    selectedDate: task.date ?? null,
  });

  // Reset form values when task changes or dialog opens in controlled mode
  useEffect(() => {
    setName(task.name);
    setDetails(task.details ?? '');
    setAiSuggestions(task.aiSuggestions ?? null);
    resetMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, open]);

  const handleAcceptSuggestion = (fieldName: string) => {
    if (!aiSuggestions?.[fieldName]) return;
    const suggestion = aiSuggestions[fieldName].suggestion;

    if (fieldName === 'name') {
      setName(suggestion);
    } else if (fieldName === 'details') {
      setDetails(suggestion);
    } else if (fieldName === 'estimatedDuration') {
      const parsed = parseInt(suggestion, 10);
      if (!isNaN(parsed)) {
        updateMetadata({ selectedDuration: parsed });
      }
    }

    setAiSuggestions((prev) =>
      prev ? { ...prev, [fieldName]: { ...prev[fieldName], userReaction: 'accepted' as const } } : null
    );
  };

  const handleRejectSuggestion = (fieldName: string) => {
    setAiSuggestions((prev) =>
      prev ? { ...prev, [fieldName]: { ...prev[fieldName], userReaction: 'rejected' as const } } : null
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTask = createInstance(TaskModel, {
      ...task,
      name,
      details,
      estimatedDuration: metadata.selectedDuration,
      list: metadata.selectedList,
      selectedAt: metadata.isStarred ? task.selectedAt || new Date() : null,
      isBlocker: metadata.isBlocker,
      date: metadata.selectedDate,
      aiSuggestions,
      updatedAt: new Date(),
    });
    updateTaskMutation.mutate(updatedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
            <Button type="submit" data-testid="save-task-changes-button">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
