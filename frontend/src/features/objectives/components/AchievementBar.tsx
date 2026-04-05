import { cn } from '@/lib/utils';
import type { ObjectiveDirection } from '../types/objective.types';

interface AchievementBarProps {
  value: number | null;
  direction: ObjectiveDirection;
  size?: 'sm' | 'md';
}

function getBarColor(pct: number): string {
  if (pct >= 100) return 'bg-primary-600';
  if (pct >= 70) return 'bg-emerald-500';
  if (pct >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

function getTextColor(pct: number): string {
  if (pct >= 100) return 'text-primary-700';
  if (pct >= 70) return 'text-emerald-700';
  if (pct >= 40) return 'text-amber-700';
  return 'text-red-600';
}

export default function AchievementBar({ value, size = 'md' }: AchievementBarProps) {
  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  if (value === null) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn('flex-1 rounded-full bg-slate-100 overflow-hidden', barHeight)}>
          <div className="h-full w-0" />
        </div>
        <span className={cn('shrink-0 text-slate-300 font-medium', textSize)}>No data</span>
      </div>
    );
  }

  const clamped = Math.min(100, Math.max(0, value));
  const barColor = getBarColor(value);
  const textColor = getTextColor(value);

  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1 rounded-full bg-slate-100 overflow-hidden', barHeight)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className={cn('shrink-0 font-semibold tabular-nums', textSize, textColor)}>
        {Math.round(value)}%
      </span>
    </div>
  );
}
