import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// ─── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export function Card({ children, className, padding = 'md', hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-stone-100 shadow-sm',
        paddingMap[padding],
        hover && 'transition-shadow duration-150 hover:shadow cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Card sub-components ──────────────────────────────────────────────────────

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 mb-5', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-900', className)}>{children}</h3>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-slate-500 leading-relaxed', className)}>{children}</p>
  );
}

export function CardDivider({ className }: { className?: string }) {
  return <hr className={cn('border-slate-100 my-5', className)} />;
}

export function CardSection({ children, title, className }: { children: ReactNode; title?: string; className?: string }) {
  return (
    <div className={cn('', className)}>
      {title && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
