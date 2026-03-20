import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DoughnutChart, type DoughnutSegment } from './DoughnutChart';

// Mock recharts - it uses SVG which jsdom can't fully render
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
}));

describe('DoughnutChart', () => {
  const segments: DoughnutSegment[] = [
    { name: 'Work', minutes: 120, color: '#3B82F6' },
    { name: 'Personal', minutes: 60, color: '#10B981' },
  ];

  it('renders empty state when no segments', () => {
    render(<DoughnutChart segments={[]} />);
    expect(screen.getByText('No tracked time to display')).toBeInTheDocument();
    expect(document.querySelector('[data-cy="doughnut-chart-empty"]')).toBeInTheDocument();
  });

  it('renders empty state when all segments have 0 minutes', () => {
    const emptySegments: DoughnutSegment[] = [
      { name: 'Work', minutes: 0, color: '#3B82F6' },
    ];
    render(<DoughnutChart segments={emptySegments} />);
    expect(screen.getByText('No tracked time to display')).toBeInTheDocument();
  });

  it('renders chart with segments', () => {
    render(<DoughnutChart segments={segments} />);
    expect(document.querySelector('[data-cy="doughnut-chart"]')).toBeInTheDocument();
    expect(document.querySelector('[data-cy="doughnut-chart-empty"]')).not.toBeInTheDocument();
  });

  it('renders legend with segment names', () => {
    render(<DoughnutChart segments={segments} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('renders formatted durations in legend', () => {
    render(<DoughnutChart segments={segments} />);
    expect(screen.getByText('2h')).toBeInTheDocument();
    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('renders total duration', () => {
    render(<DoughnutChart segments={segments} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('3h')).toBeInTheDocument();
  });

  it('filters out segments with 0 minutes', () => {
    const withZero: DoughnutSegment[] = [
      { name: 'Work', minutes: 60, color: '#3B82F6' },
      { name: 'Empty', minutes: 0, color: '#999' },
    ];
    render(<DoughnutChart segments={withZero} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<DoughnutChart segments={segments} className="custom-chart" />);
    const chart = document.querySelector('[data-cy="doughnut-chart"]');
    expect(chart?.className).toContain('custom-chart');
  });

  it('renders color indicators in legend', () => {
    render(<DoughnutChart segments={segments} />);
    const legend = document.querySelector('[data-cy="doughnut-chart-legend"]');
    expect(legend).toBeInTheDocument();
    const colorDots = legend?.querySelectorAll('.rounded-sm');
    expect(colorDots?.length).toBe(2);
  });
});
