import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TimeSpentBadge } from './TimeSpentBadge';

const meta = {
  title: 'Timer/TimeSpentBadge',
  component: TimeSpentBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TimeSpentBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UnderEstimate: Story = {
  args: {
    actualMinutes: 45,
    estimatedMinutes: 60,
  },
};

export const OverEstimate: Story = {
  args: {
    actualMinutes: 90,
    estimatedMinutes: 60,
  },
};

export const NoEstimate: Story = {
  args: {
    actualMinutes: 30,
    estimatedMinutes: null,
  },
};

export const ExactlyOnEstimate: Story = {
  args: {
    actualMinutes: 60,
    estimatedMinutes: 60,
  },
};

export const ShortDuration: Story = {
  args: {
    actualMinutes: 15,
    estimatedMinutes: 30,
  },
};

export const LongDuration: Story = {
  args: {
    actualMinutes: 240,
    estimatedMinutes: 150,
  },
};

export const ZeroMinutes: Story = {
  args: {
    actualMinutes: 0,
    estimatedMinutes: 60,
  },
};
