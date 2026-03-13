'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/shared/lib/utils';
import { formatDuration } from '@/shared/lib/format-duration';

export interface DoughnutSegment {
  name: string;
  minutes: number;
  color: string; // hex color
}

interface DoughnutChartProps {
  segments: DoughnutSegment[];
  className?: string;
}

function EmptyState() {
  return (
    <div
      data-cy="doughnut-chart-empty"
      className="flex items-center justify-center py-6 text-sm text-muted-foreground"
    >
      No tracked time to display
    </div>
  );
}

export function DoughnutChart({ segments, className }: DoughnutChartProps) {
  const filtered = segments.filter((s) => s.minutes > 0);

  if (filtered.length === 0) {
    return <EmptyState />;
  }

  const totalMinutes = filtered.reduce((sum, s) => sum + s.minutes, 0);

  const data = filtered.map((s) => ({
    name: s.name,
    value: s.minutes,
    color: s.color,
  }));

  return (
    <div data-cy="doughnut-chart" className={cn('flex items-center gap-6', className)}>
      {/* Chart */}
      <div className="w-[140px] h-[140px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              dataKey="value"
              stroke="none"
              animationDuration={400}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-0" data-cy="doughnut-chart-legend">
        {filtered.map((segment) => (
          <div key={segment.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-foreground truncate">{segment.name}</span>
            <span className="text-sm text-muted-foreground ml-auto flex-shrink-0">
              {formatDuration(segment.minutes)}
            </span>
          </div>
        ))}
        <div className="border-t border-border pt-1.5 mt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-sm font-medium text-foreground">
              {formatDuration(totalMinutes)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
