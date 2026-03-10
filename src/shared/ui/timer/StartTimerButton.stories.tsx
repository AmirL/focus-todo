import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StartTimerButton } from './StartTimerButton';

const meta = {
  title: 'Timer/StartTimerButton',
  component: StartTimerButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StartTimerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    isRunning: false,
  },
};

export const Running: Story = {
  args: {
    isRunning: true,
  },
};

export const Disabled: Story = {
  args: {
    isRunning: false,
    disabled: true,
  },
};

export const InTaskRow: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center gap-3 px-4 py-3 border rounded-md bg-white w-[400px]">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
        <Story />
        <span className="text-sm">Example task name</span>
      </div>
    ),
  ],
  args: {
    isRunning: false,
  },
};

export const InTaskRowRunning: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center gap-3 px-4 py-3 border rounded-md bg-white w-[400px]">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
        <Story />
        <span className="text-sm">Example task name</span>
      </div>
    ),
  ],
  args: {
    isRunning: true,
  },
};
