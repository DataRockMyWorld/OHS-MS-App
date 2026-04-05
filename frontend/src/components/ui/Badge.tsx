import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type BadgeVariant =
  | 'slate' | 'blue' | 'amber' | 'orange' | 'teal' | 'green' | 'red' | 'purple' | 'yellow';

interface BadgeConfig {
  bg: string;
  text: string;
  ring: string;
  dot: string;
}

const VARIANTS: Record<BadgeVariant, BadgeConfig> = {
  slate:  { bg: 'bg-slate-100',   text: 'text-slate-600',   ring: 'ring-slate-200',   dot: 'bg-slate-400' },
  blue:   { bg: 'bg-blue-50',     text: 'text-blue-700',    ring: 'ring-blue-100',    dot: 'bg-blue-500' },
  amber:  { bg: 'bg-amber-50',    text: 'text-amber-700',   ring: 'ring-amber-100',   dot: 'bg-amber-500' },
  orange: { bg: 'bg-orange-50',   text: 'text-orange-700',  ring: 'ring-orange-100',  dot: 'bg-orange-500' },
  teal:   { bg: 'bg-teal-50',     text: 'text-teal-700',    ring: 'ring-teal-100',    dot: 'bg-teal-500' },
  green:  { bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-100', dot: 'bg-emerald-500' },
  red:    { bg: 'bg-red-50',      text: 'text-red-700',     ring: 'ring-red-100',     dot: 'bg-red-500' },
  purple: { bg: 'bg-purple-50',   text: 'text-purple-700',  ring: 'ring-purple-100',  dot: 'bg-purple-500' },
  yellow: { bg: 'bg-yellow-50',   text: 'text-yellow-700',  ring: 'ring-yellow-100',  dot: 'bg-yellow-500' },
};

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export default function Badge({
  variant = 'slate',
  dot = false,
  children,
  className,
  size = 'md',
}: BadgeProps) {
  const { bg, text, ring, dot: dotColor } = VARIANTS[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full ring-1 ring-inset',
        bg, text, ring,
        size === 'sm' ? 'gap-1 px-2 py-0.5 text-[11px]' : 'gap-1.5 px-2.5 py-1 text-xs',
        className,
      )}
    >
      {dot && (
        <span className={cn('shrink-0 rounded-full', dotColor, size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5')} />
      )}
      {children}
    </span>
  );
}
