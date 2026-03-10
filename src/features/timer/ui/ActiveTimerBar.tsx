'use client';
import { useCallback, useEffect, useState } from 'react';
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

  // Local state for time inputs to avoid overwriting during editing
  const [localStartTime, setLocalStartTime] = useState('');
  const [localEndTime, setLocalEndTime] = useState('');

  // Sync local state from activeEntry when it changes
  const startedAt = activeEntry?.startedAt;
  const endedAt = activeEntry?.endedAt;
  useEffect(() => {
    if (startedAt) {
      setLocalStartTime(dayjs(startedAt).format('HH:mm'));
    }
    if (endedAt) {
      setLocalEndTime(dayjs(endedAt).format('HH:mm'));
    } else {
      setLocalEndTime('');
    }
  }, [startedAt, endedAt]);

  // Update "now" every second for live duration
  useEffect(() => {
    if (!activeEntry || activeEntry.endedAt) return;
    const interval = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  const saveStartTime = useCallback(async () => {
    if (!activeEntry) return;
    const [h, m] = localStartTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const newStart = dayjs(activeEntry.startedAt).hour(h).minute(m).second(0);
    const updated = await updateEntry.mutateAsync({
      id: activeEntry.id,
      startedAt: newStart.toISOString(),
    });
    setActiveEntry(updated);
  }, [activeEntry, localStartTime, updateEntry, setActiveEntry]);

  const saveEndTime = useCallback(async () => {
    if (!activeEntry?.endedAt) return;
    const [h, m] = localEndTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const newEnd = dayjs(activeEntry.endedAt).hour(h).minute(m).second(0);
    const updated = await updateEntry.mutateAsync({
      id: activeEntry.id,
      endedAt: newEnd.toISOString(),
    });
    setActiveEntry(updated);
  }, [activeEntry, localEndTime, updateEntry, setActiveEntry]);

  if (!activeEntry) return null;

  const task = tasks?.find((t) => String(t.id) === String(activeEntry.taskId));
  const taskName = task?.name ?? `Task #${activeEntry.taskId}`;

  const isRunning = !activeEntry.endedAt;

  // Calculate duration from local edited values for immediate feedback
  const getLocalDayjs = (base: string, localTime: string) => {
    const [h, m] = localTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return dayjs(base);
    return dayjs(base).hour(h).minute(m).second(0);
  };
  const startMoment = localStartTime ? getLocalDayjs(activeEntry.startedAt, localStartTime) : dayjs(activeEntry.startedAt);
  const endMoment = activeEntry.endedAt
    ? (localEndTime ? getLocalDayjs(activeEntry.endedAt, localEndTime) : dayjs(activeEntry.endedAt))
    : now;
  const diffMinutes = Math.max(0, endMoment.diff(startMoment, 'minute'));
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const handleStop = async () => {
    const stopped = await stopTimer.mutateAsync();
    // Keep the stopped entry visible so user can edit end time
    setActiveEntry(stopped);
  };

  const handleDismiss = () => {
    setActiveEntry(null);
  };

  return (
    <TimerBar
      taskName={taskName}
      startTime={localStartTime}
      endTime={activeEntry.endedAt ? localEndTime : undefined}
      duration={duration}
      isRunning={isRunning}
      onStartTimeChange={setLocalStartTime}
      onStartTimeBlur={saveStartTime}
      onEndTimeChange={setLocalEndTime}
      onEndTimeBlur={saveEndTime}
      onStop={handleStop}
      onDismiss={handleDismiss}
    />
  );
}
