import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TimerBar } from './TimerBar';

const meta = {
  title: 'Timer/TimerBar',
  component: TimerBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TimerBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = {
  args: {
    taskName: 'Implement user authentication flow',
    startTime: '09:30',
    duration: '1h 23m',
    isRunning: true,
  },
};

export const Stopped: Story = {
  args: {
    taskName: 'Review pull request #42',
    startTime: '14:00',
    endTime: '15:30',
    duration: '1h 30m',
    isRunning: false,
  },
};

export const LongTaskName: Story = {
  args: {
    taskName: 'Refactor the entire database layer to support multi-tenant architecture with proper isolation',
    startTime: '10:15',
    duration: '45m',
    isRunning: true,
  },
};

export const ShortSession: Story = {
  args: {
    taskName: 'Quick bug fix',
    startTime: '16:45',
    endTime: '16:55',
    duration: '10m',
    isRunning: false,
  },
};

export const StoppedEditable: Story = {
  args: {
    taskName: 'Write documentation for API endpoints',
    startTime: '11:00',
    endTime: '12:30',
    duration: '1h 30m',
    isRunning: false,
  },
};

export const SavedConfirmation: Story = {
  args: {
    taskName: 'Task with save confirmation',
    startTime: '09:30',
    endTime: '10:45',
    duration: '1h 15m',
    isRunning: false,
    saveStatus: 'saved',
  },
};

export const SaveFailed: Story = {
  args: {
    taskName: 'Task with save error',
    startTime: '09:30',
    endTime: '10:45',
    duration: '1h 15m',
    isRunning: false,
    saveStatus: 'error',
  },
};
