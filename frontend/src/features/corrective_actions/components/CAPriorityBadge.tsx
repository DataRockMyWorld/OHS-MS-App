import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import type { CAPriority } from '../types/ca.types';

const PRIORITY_MAP: Record<CAPriority, { label: string; variant: BadgeVariant }> = {
  low:      { label: 'Low',      variant: 'slate'  },
  medium:   { label: 'Medium',   variant: 'blue'   },
  high:     { label: 'High',     variant: 'orange' },
  critical: { label: 'Critical', variant: 'red'    },
};

interface Props {
  priority: CAPriority;
  size?: 'sm' | 'md';
  className?: string;
}

export default function CAPriorityBadge({ priority, size = 'md', className }: Props) {
  const { label, variant } = PRIORITY_MAP[priority] ?? { label: priority, variant: 'slate' };
  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  );
}
