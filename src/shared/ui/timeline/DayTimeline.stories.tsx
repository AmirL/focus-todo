import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DayTimeline } from './DayTimeline';
import type { TimelineBlock } from './TimelineBar';

const meta = {
  title: 'Timer/DayTimeline',
  component: DayTimeline,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, height: 700, margin: '2rem auto', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DayTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

function todayAt(hour: number, minute: number = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const today = new Date();

// --- Stories ---

export const EmptyDay: Story = {
  args: {
    date: today,
    blocks: [],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
  },
};

export const FewEntries: Story = {
  args: {
    date: today,
    blocks: [
      {
        id: '1',
        taskName: 'Morning standup',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(9, 15),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 15,
      },
      {
        id: '2',
        taskName: 'Feature development',
        startedAt: todayAt(10, 0),
        endedAt: todayAt(12, 0),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 120,
      },
      {
        id: '3',
        taskName: 'Lunch walk',
        startedAt: todayAt(12, 30),
        endedAt: todayAt(13, 15),
        listName: 'Personal',
        listColor: 'violet',
        durationMinutes: 45,
      },
    ],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
    onGapClick: (gap) => console.log('Gap clicked:', gap),
    onBlockDelete: (block) => console.log('Delete:', block.taskName),
    onBlockEdit: (block, start, end) => console.log('Edit:', block.taskName, start, end),
  },
};

export const BusyDay: Story = {
  args: {
    date: today,
    blocks: [
      {
        id: '1',
        taskName: 'Email triage',
        startedAt: todayAt(8, 0),
        endedAt: todayAt(8, 30),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 30,
      },
      {
        id: '2',
        taskName: 'Sprint planning',
        startedAt: todayAt(8, 30),
        endedAt: todayAt(9, 30),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 60,
      },
      {
        id: '3',
        taskName: 'Feature development',
        startedAt: todayAt(9, 45),
        endedAt: todayAt(12, 0),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 135,
      },
      {
        id: '4',
        taskName: 'Lunch walk',
        startedAt: todayAt(12, 0),
        endedAt: todayAt(12, 45),
        listName: 'Personal',
        listColor: 'violet',
        durationMinutes: 45,
      },
      {
        id: '5',
        taskName: 'Code review',
        startedAt: todayAt(13, 0),
        endedAt: todayAt(14, 30),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 90,
      },
      {
        id: '6',
        taskName: 'Bug fixes',
        startedAt: todayAt(14, 30),
        endedAt: todayAt(16, 0),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 90,
      },
      {
        id: '7',
        taskName: 'Gym',
        startedAt: todayAt(16, 30),
        endedAt: todayAt(17, 30),
        listName: 'Personal',
        listColor: 'violet',
        durationMinutes: 60,
      },
      {
        id: '8',
        taskName: 'Reading',
        startedAt: todayAt(20, 0),
        endedAt: todayAt(21, 0),
        listName: 'Personal',
        listColor: 'violet',
        durationMinutes: 60,
      },
    ] as TimelineBlock[],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
    onGapClick: (gap) => console.log('Gap clicked:', gap),
    onBlockDelete: (block) => console.log('Delete:', block.taskName),
    onBlockEdit: (block, start, end) => console.log('Edit:', block.taskName, start, end),
  },
};

export const CurrentlyRunning: Story = {
  args: {
    date: today,
    blocks: [
      {
        id: '1',
        taskName: 'Morning research',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(10, 30),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 90,
      },
      {
        id: '2',
        taskName: 'Implementing timeline component',
        startedAt: todayAt(11, 0),
        endedAt: null,
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: null,
      },
    ],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
    onBlockDelete: (block) => console.log('Delete:', block.taskName),
  },
};

export const EditMode: Story = {
  args: {
    date: today,
    blocks: [
      {
        id: '1',
        taskName: 'Design review',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(10, 30),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 90,
      },
      {
        id: '2',
        taskName: 'Meditation',
        startedAt: todayAt(11, 0),
        endedAt: todayAt(11, 30),
        listName: 'Personal',
        listColor: 'violet',
        durationMinutes: 30,
      },
    ],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
    onBlockEdit: (block, start, end) => console.log('Edit:', block.taskName, start, end),
    onBlockDelete: (block) => console.log('Delete:', block.taskName),
  },
};

export const GapHover: Story = {
  args: {
    date: today,
    blocks: [
      {
        id: '1',
        taskName: 'Morning standup',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(9, 15),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 15,
      },
      {
        id: '2',
        taskName: 'Code review',
        startedAt: todayAt(11, 0),
        endedAt: todayAt(12, 0),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 60,
      },
      {
        id: '3',
        taskName: 'Lunch',
        startedAt: todayAt(14, 0),
        endedAt: todayAt(14, 30),
        listName: 'Personal',
        listColor: 'violet',
        durationMinutes: 30,
      },
    ],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
    onGapClick: (gap) => console.log('Gap clicked:', gap),
  },
};

export const MixedWorkAndPersonal: Story = {
  args: {
    date: today,
    blocks: [
      {
        id: '1',
        taskName: 'Deep work session',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(11, 0),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 120,
      },
      {
        id: '2',
        taskName: 'Meditation',
        startedAt: todayAt(11, 15),
        endedAt: todayAt(11, 30),
        listName: 'Personal',
        listColor: 'violet',
        durationMinutes: 15,
      },
      {
        id: '3',
        taskName: 'Client meeting',
        startedAt: todayAt(13, 0),
        endedAt: todayAt(14, 0),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 60,
      },
      {
        id: '4',
        taskName: 'Grocery planning',
        startedAt: todayAt(14, 30),
        endedAt: todayAt(14, 45),
        listName: 'Personal',
        listColor: 'violet',
        durationMinutes: 15,
      },
      {
        id: '5',
        taskName: 'API documentation',
        startedAt: todayAt(15, 0),
        endedAt: todayAt(17, 0),
        listName: 'Work',
        listColor: 'blue',
        durationMinutes: 120,
      },
      {
        id: '6',
        taskName: 'Evening run',
        startedAt: todayAt(18, 0),
        endedAt: todayAt(19, 0),
        listName: 'Personal',
        listColor: 'violet',
        durationMinutes: 60,
      },
    ],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
    onGapClick: (gap) => console.log('Gap clicked:', gap),
    onBlockDelete: (block) => console.log('Delete:', block.taskName),
    onBlockEdit: (block, start, end) => console.log('Edit:', block.taskName, start, end),
  },
};

export const ShortEntries: Story = {
  args: {
    date: today,
    blocks: [
      {
        id: '1',
        taskName: 'Quick standup sync meeting with the whole team',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(9, 10),
        listName: 'Work',
        durationMinutes: 10,
      },
      {
        id: '2',
        taskName: 'Coffee break',
        startedAt: todayAt(9, 15),
        endedAt: todayAt(9, 25),
        listName: 'Personal',
        durationMinutes: 10,
      },
      {
        id: '3',
        taskName: 'Deploy hotfix to production',
        startedAt: todayAt(9, 30),
        endedAt: todayAt(9, 45),
        listName: 'Work',
        durationMinutes: 15,
      },
      {
        id: '4',
        taskName: 'Long design review session',
        startedAt: todayAt(10, 0),
        endedAt: todayAt(11, 30),
        listName: 'Work',
        durationMinutes: 90,
      },
      {
        id: '5',
        taskName: 'Slack check',
        startedAt: todayAt(11, 33),
        endedAt: todayAt(11, 38),
        listName: 'Work',
        durationMinutes: 5,
      },
      {
        id: '6',
        taskName: 'Afternoon focus',
        startedAt: todayAt(13, 0),
        endedAt: todayAt(15, 0),
        listName: 'Work',
        durationMinutes: 120,
      },
    ] as TimelineBlock[],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
    onGapClick: (gap) => console.log('Gap clicked:', gap),
    onBlockDelete: (block) => console.log('Delete:', block.taskName),
    onBlockEdit: (block, start, end) => console.log('Edit:', block.taskName, start, end),
  },
};

/** Four consecutive short entries placed side-by-side in columns */
export const ShortEntriesSideBySide: Story = {
  args: {
    date: today,
    blocks: [
      {
        id: '1',
        taskName: 'Standup',
        startedAt: todayAt(9, 0),
        endedAt: todayAt(9, 15),
        listName: 'Work',
        durationMinutes: 15,
      },
      {
        id: '2',
        taskName: 'Quick email check',
        startedAt: todayAt(9, 15),
        endedAt: todayAt(9, 25),
        listName: 'Work',
        durationMinutes: 10,
      },
      {
        id: '3',
        taskName: 'Coffee break',
        startedAt: todayAt(9, 25),
        endedAt: todayAt(9, 35),
        listName: 'Personal',
        durationMinutes: 10,
      },
      {
        id: '4',
        taskName: 'Deploy hotfix',
        startedAt: todayAt(9, 40),
        endedAt: todayAt(9, 55),
        listName: 'Work',
        durationMinutes: 15,
      },
      {
        id: '5',
        taskName: 'Long feature development session',
        startedAt: todayAt(10, 0),
        endedAt: todayAt(12, 0),
        listName: 'Work',
        durationMinutes: 120,
      },
      {
        id: '6',
        taskName: 'Lunch walk',
        startedAt: todayAt(12, 0),
        endedAt: todayAt(12, 20),
        listName: 'Personal',
        durationMinutes: 20,
      },
      {
        id: '7',
        taskName: 'Quick review',
        startedAt: todayAt(12, 25),
        endedAt: todayAt(12, 40),
        listName: 'Work',
        durationMinutes: 15,
      },
      {
        id: '8',
        taskName: 'Afternoon deep work',
        startedAt: todayAt(13, 0),
        endedAt: todayAt(15, 0),
        listName: 'Work',
        durationMinutes: 120,
      },
    ] as TimelineBlock[],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
    onGapClick: (gap) => console.log('Gap clicked:', gap),
    onBlockDelete: (block) => console.log('Delete:', block.taskName),
    onBlockEdit: (block, start, end) => console.log('Edit:', block.taskName, start, end),
  },
};

/** Short entry followed by a longer entry across hour boundary (overlap edge case) */
export const CrossHourOverlap: Story = {
  args: {
    date: today,
    blocks: [
      {
        id: '1',
        taskName: 'Deep work',
        startedAt: todayAt(10, 0),
        endedAt: todayAt(12, 0),
        listName: 'Work',
        durationMinutes: 120,
      },
      {
        id: '2',
        taskName: 'Quick coffee',
        startedAt: todayAt(12, 0),
        endedAt: todayAt(12, 10),
        listName: 'Personal',
        durationMinutes: 10,
      },
      {
        id: '3',
        taskName: 'Обед',
        startedAt: todayAt(13, 53),
        endedAt: todayAt(14, 6),
        listName: 'Personal',
        durationMinutes: 13,
      },
      {
        id: '4',
        taskName: 'Meeting with Oskar',
        startedAt: todayAt(14, 6),
        endedAt: todayAt(15, 6),
        listName: 'Work',
        durationMinutes: 60,
      },
      {
        id: '5',
        taskName: 'Quick Slack check',
        startedAt: todayAt(15, 10),
        endedAt: todayAt(15, 15),
        listName: 'Work',
        durationMinutes: 5,
      },
      {
        id: '6',
        taskName: 'Afternoon coding',
        startedAt: todayAt(15, 20),
        endedAt: todayAt(17, 0),
        listName: 'Work',
        durationMinutes: 100,
      },
    ] as TimelineBlock[],
    onPrevDay: () => console.log('Previous day'),
    onNextDay: () => console.log('Next day'),
    onGapClick: (gap) => console.log('Gap clicked:', gap),
    onBlockDelete: (block) => console.log('Delete:', block.taskName),
    onBlockEdit: (block, start, end) => console.log('Edit:', block.taskName, start, end),
  },
};
