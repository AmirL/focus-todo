import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DoughnutChart } from './DoughnutChart';
import { LIST_COLOR_HEX } from '@/shared/lib/colors';

const meta = {
  title: 'Charts/DoughnutChart',
  component: DoughnutChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DoughnutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleCategories: Story = {
  args: {
    segments: [
      { name: 'Work', minutes: 195, color: LIST_COLOR_HEX.blue },
      { name: 'Personal', minutes: 90, color: LIST_COLOR_HEX.violet },
      { name: 'Side Project', minutes: 45, color: LIST_COLOR_HEX.emerald },
    ],
  },
};

export const SingleCategory: Story = {
  args: {
    segments: [
      { name: 'Work', minutes: 480, color: LIST_COLOR_HEX.blue },
    ],
  },
};

export const Empty: Story = {
  args: {
    segments: [],
  },
};

export const ManyCategories: Story = {
  args: {
    segments: [
      { name: 'Work', minutes: 240, color: LIST_COLOR_HEX.blue },
      { name: 'Personal', minutes: 120, color: LIST_COLOR_HEX.violet },
      { name: 'Health', minutes: 60, color: LIST_COLOR_HEX.emerald },
      { name: 'Learning', minutes: 45, color: LIST_COLOR_HEX.orange },
      { name: 'Admin', minutes: 30, color: LIST_COLOR_HEX.slate },
    ],
  },
};

export const ShortDurations: Story = {
  args: {
    segments: [
      { name: 'Work', minutes: 15, color: LIST_COLOR_HEX.blue },
      { name: 'Personal', minutes: 8, color: LIST_COLOR_HEX.violet },
    ],
  },
};
