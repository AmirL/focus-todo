'use client';
import { useEffect, useState } from 'react';
import { TimerBar } from '@/shared/ui/timer';
import { useTimerStore } from '../model/timerStore';
import { useStopTimerMutation, useUpdateTimeEntryMutation } from '@/shared/api/time-entries';
import { useTasksQuery } from '@/shared/api/tasks';
import dayjs from 'dayjs';

export function ActiveTimerBar() {
  const activeEntry = useTimerStore((s) => s.activeEntry);
  const setActiveEntry = useTimerStore((s) => s.setActiveEntry);
  const stopTimer = useStopTimerMutation();
  const updateEntry = useUpdateTimeEntryMutation();
  const { data: tasks } = useTasksQuery();
  const [now, setNow] = useState(dayjs());

  // Update "now" every second for live duration
  useEffect(() => {
    if (!activeEntry || activeEntry.endedAt) return;
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  if (!activeEntry) return null;

  const task = tasks?.find((t) => String(t.id) === String(activeEntry.taskId));
  const taskName = task?.name ?? `Task #${activeEntry.taskId}`;

  const startTime = dayjs(activeEntry.startedAt).format('HH:mm');
  const endTime = activeEntry.endedAt ? dayjs(activeEntry.endedAt).format('HH:mm') : undefined;
  const isRunning = !activeEntry.endedAt;

  const endMoment = activeEntry.endedAt ? dayjs(activeEntry.endedAt) : now;
  const diffMinutes = Math.max(0, endMoment.diff(dayjs(activeEntry.startedAt), 'minute'));
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const handleStop = async () => {
    await stopTimer.mutateAsync();
    setActiveEntry(null);
  };

  const handleDismiss = () => {
    setActiveEntry(null);
  };

  const handleStartTimeChange = async (value: string) => {
    const [h, m] = value.split(':').map(Number);
    const newStart = dayjs(activeEntry.startedAt).hour(h).minute(m).second(0);
    const updated = await updateEntry.mutateAsync({
      id: activeEntry.id,
      startedAt: newStart.format('YYYY-MM-DD HH:mm:ss'),
    });
    setActiveEntry(updated);
  };

  const handleEndTimeChange = async (value: string) => {
    if (!activeEntry.endedAt) return;
    const [h, m] = value.split(':').map(Number);
    const newEnd = dayjs(activeEntry.endedAt).hour(h).minute(m).second(0);
    const updated = await updateEntry.mutateAsync({
      id: activeEntry.id,
      endedAt: newEnd.format('YYYY-MM-DD HH:mm:ss'),
    });
    setActiveEntry(updated);
  };

  return (
    <TimerBar
      taskName={taskName}
      startTime={startTime}
      endTime={endTime}
      duration={duration}
      isRunning={isRunning}
      onStartTimeChange={handleStartTimeChange}
      onEndTimeChange={handleEndTimeChange}
      onStop={handleStop}
      onDismiss={handleDismiss}
    />
  );
}
