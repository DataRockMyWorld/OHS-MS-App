import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import type { CAStatus } from '../types/ca.types';

const STATUS_MAP: Record<CAStatus, { label: string; variant: BadgeVariant }> = {
  open:        { label: 'Open',                      variant: 'blue'   },
  in_progress: { label: 'In Progress',               variant: 'amber'  },
  implemented: { label: 'Awaiting Review',            variant: 'orange' },
  closed:      { label: 'Closed',                    variant: 'teal'   },
  reopened:    { label: 'Reopened',                  variant: 'red'    },
};

interface Props {
  status: CAStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function CAStatusBadge({ status, size = 'md', className }: Props) {
  const { label, variant } = STATUS_MAP[status] ?? { label: status, variant: 'slate' };
  return (
    <Badge variant={variant} dot size={size} className={className}>
      {label}
    </Badge>
  );
}
