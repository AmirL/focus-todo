'use client';
import { StartTimerButton } from '@/shared/ui/timer';
import { useTimerStore } from '../model/timerStore';
import { useStartTimerMutation, useStopTimerMutation } from '@/shared/api/time-entries';
import { startLiveActivity, endLiveActivity } from '../lib/liveActivityBridge';

interface TaskStartTimerButtonProps {
  taskId: number;
  taskName: string;
}

export function TaskStartTimerButton({ taskId, taskName }: TaskStartTimerButtonProps) {
  const activeEntry = useTimerStore((s) => s.activeEntry);
  const setActiveEntry = useTimerStore((s) => s.setActiveEntry);
  const startTimer = useStartTimerMutation();
  const stopTimer = useStopTimerMutation();

  const isRunning = activeEntry?.taskId === taskId && !activeEntry.endedAt;

  const handleClick = async () => {
    if (isRunning) {
      const stopped = await stopTimer.mutateAsync();
      setActiveEntry(stopped);
      await endLiveActivity();
    } else {
      const entry = await startTimer.mutateAsync(taskId);
      setActiveEntry(entry);
      await startLiveActivity(taskName);
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
