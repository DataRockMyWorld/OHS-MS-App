import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Accent = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const accentText: Record<Accent, string> = {
  default: 'text-slate-900',
  primary: 'text-primary-700',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger:  'text-red-600',
  info:    'text-blue-600',
};

const accentBorder: Record<Accent, string> = {
  default: 'border-l-stone-200',
  primary: 'border-l-primary-500',
  success: 'border-l-emerald-400',
  warning: 'border-l-amber-400',
  danger:  'border-l-red-400',
  info:    'border-l-blue-400',
};

interface StatCardProps {
  label: string;
  value: number | string | undefined;
  description?: string;
  accent?: Accent;
  icon?: ReactNode;
  className?: string;
}

export default function StatCard({
  label,
  value,
  description,
  accent = 'default',
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-stone-100 shadow-sm',
        'border-l-[3px]',
        accentBorder[accent],
        'pl-5 pr-5 py-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={cn('mt-2 text-3xl font-bold tracking-tight leading-none', accentText[accent])}>
            {value ?? '—'}
          </p>
          {description && (
            <p className="mt-1.5 text-xs text-slate-400">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-stone-50 border border-stone-100 text-slate-400 shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
