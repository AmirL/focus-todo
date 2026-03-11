import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TimelineBar, TimelineBlock } from './TimelineBar';

const meta = {
  title: 'Timer/TimelineBar',
  component: TimelineBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800, margin: '2rem auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimelineBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create ISO date strings for today at a given hour:minute
function todayAt(hour: number, minute: number = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// --- Stories ---

export const SingleShortEntry: Story = {
  args: {
    blocks: [
      {
        id: '1',
        taskName: 'Fix login bug',
        startedAt: todayAt(10, 0),
        endedAt: todayAt(10, 30),
        listName: 'Work',
        durationMinutes: 30,
      },
    ],
  },
};

export const MultipleEntriesWithGaps: Story = {
  args: {
    blocks: [
      {
        id: '1',
        taskName: 'Morning standup notes',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(9, 15),
        listName: 'Work',
        durationMinutes: 15,
      },
      {
        id: '2',
        taskName: 'Read articles',
        startedAt: todayAt(10, 0),
        endedAt: todayAt(10, 45),
        listName: 'Personal',
        durationMinutes: 45,
      },
      {
        id: '3',
        taskName: 'API refactoring',
        startedAt: todayAt(11, 30),
        endedAt: todayAt(13, 0),
        listName: 'Work',
        durationMinutes: 90,
      },
    ],
  },
};

export const BackToBackEntries: Story = {
  args: {
    blocks: [
      {
        id: '1',
        taskName: 'Design review',
        startedAt: todayAt(14, 0),
        endedAt: todayAt(14, 45),
        listName: 'Work',
        durationMinutes: 45,
      },
      {
        id: '2',
        taskName: 'Implement feedback',
        startedAt: todayAt(14, 45),
        endedAt: todayAt(15, 30),
        listName: 'Work',
        durationMinutes: 45,
      },
      {
        id: '3',
        taskName: 'Write tests',
        startedAt: todayAt(15, 30),
        endedAt: todayAt(16, 15),
        listName: 'Work',
        durationMinutes: 45,
      },
    ],
  },
};

export const FullBusyDay: Story = {
  args: {
    blocks: [
      {
        id: '1',
        taskName: 'Email triage',
        startedAt: todayAt(8, 0),
        endedAt: todayAt(8, 30),
        listName: 'Work',
        durationMinutes: 30,
      },
      {
        id: '2',
        taskName: 'Sprint planning',
        startedAt: todayAt(8, 30),
        endedAt: todayAt(9, 30),
        listName: 'Work',
        durationMinutes: 60,
      },
      {
        id: '3',
        taskName: 'Feature development',
        startedAt: todayAt(9, 45),
        endedAt: todayAt(12, 0),
        listName: 'Work',
        durationMinutes: 135,
      },
      {
        id: '4',
        taskName: 'Lunch walk',
        startedAt: todayAt(12, 0),
        endedAt: todayAt(12, 45),
        listName: 'Personal',
        durationMinutes: 45,
      },
      {
        id: '5',
        taskName: 'Code review',
        startedAt: todayAt(13, 0),
        endedAt: todayAt(14, 30),
        listName: 'Work',
        durationMinutes: 90,
      },
      {
        id: '6',
        taskName: 'Bug fixes',
        startedAt: todayAt(14, 30),
        endedAt: todayAt(16, 0),
        listName: 'Work',
        durationMinutes: 90,
      },
      {
        id: '7',
        taskName: 'Gym',
        startedAt: todayAt(16, 30),
        endedAt: todayAt(17, 30),
        listName: 'Personal',
        durationMinutes: 60,
      },
    ] as TimelineBlock[],
  },
};

export const EmptyState: Story = {
  args: {
    blocks: [],
  },
};

export const CurrentlyRunningTimer: Story = {
  args: {
    blocks: [
      {
        id: '1',
        taskName: 'Morning research',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(10, 30),
        listName: 'Work',
        durationMinutes: 90,
      },
      {
        id: '2',
        taskName: 'Implementing timeline component',
        startedAt: todayAt(11, 0),
        endedAt: null,
        listName: 'Work',
        durationMinutes: null,
      },
    ],
  },
};

export const ClickableGaps: Story = {
  args: {
    blocks: [
      {
        id: '1',
        taskName: 'Morning standup',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(9, 15),
        listName: 'Work',
        durationMinutes: 15,
      },
      {
        id: '2',
        taskName: 'Code review',
        startedAt: todayAt(10, 0),
        endedAt: todayAt(11, 0),
        listName: 'Work',
        durationMinutes: 60,
      },
      {
        id: '3',
        taskName: 'Lunch',
        startedAt: todayAt(12, 30),
        endedAt: todayAt(13, 0),
        listName: 'Personal',
        durationMinutes: 30,
      },
    ],
    onGapClick: (gap) => console.log('Gap clicked:', gap),
  },
};

export const MixedWorkAndPersonal: Story = {
  args: {
    blocks: [
      {
        id: '1',
        taskName: 'Deep work session',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(11, 0),
        listName: 'Work',
        durationMinutes: 120,
      },
      {
        id: '2',
        taskName: 'Meditation',
        startedAt: todayAt(11, 15),
        endedAt: todayAt(11, 30),
        listName: 'Personal',
        durationMinutes: 15,
      },
      {
        id: '3',
        taskName: 'Client meeting',
        startedAt: todayAt(13, 0),
        endedAt: todayAt(14, 0),
        listName: 'Work',
        durationMinutes: 60,
      },
      {
        id: '4',
        taskName: 'Grocery planning',
        startedAt: todayAt(14, 30),
        endedAt: todayAt(14, 45),
        listName: 'Personal',
        durationMinutes: 15,
      },
    ],
  },
};
