'use client';
import { StartTimerButton } from '@/shared/ui/timer';
import { useTimerStore } from '../model/timerStore';
import { useStartTimerMutation, useStopTimerMutation } from '@/shared/api/time-entries';

interface TaskStartTimerButtonProps {
  taskId: number;
}

export function TaskStartTimerButton({ taskId }: TaskStartTimerButtonProps) {
  const activeEntry = useTimerStore((s) => s.activeEntry);
  const setActiveEntry = useTimerStore((s) => s.setActiveEntry);
  const startTimer = useStartTimerMutation();
  const stopTimer = useStopTimerMutation();

  const isRunning = activeEntry?.taskId === taskId && !activeEntry.endedAt;

  const handleClick = async () => {
    if (isRunning) {
      const stopped = await stopTimer.mutateAsync();
      // Keep the stopped entry visible so user can edit end time in the timer bar
      setActiveEntry(stopped);
    } else {
      const entry = await startTimer.mutateAsync(taskId);
      setActiveEntry(entry);
    }
  };

  return (
    <StartTimerButton
      isRunning={isRunning}
      onClick={handleClick}
      disabled={startTimer.isPending || stopTimer.isPending}
    />
  );
}
