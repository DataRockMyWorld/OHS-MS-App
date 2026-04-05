import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizePadding = size === 'sm' ? 'py-10' : size === 'lg' ? 'py-24' : 'py-16';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        sizePadding,
        className,
      )}
    >
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
