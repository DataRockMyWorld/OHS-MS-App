import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import type { ObjectiveStatus } from '../types/objective.types';

const STATUS_MAP: Record<ObjectiveStatus, { label: string; variant: BadgeVariant }> = {
  on_track: { label: 'On Track', variant: 'green' },
  at_risk:  { label: 'At Risk',  variant: 'amber' },
  behind:   { label: 'Behind',   variant: 'red'   },
  achieved: { label: 'Achieved', variant: 'blue'  },
  closed:   { label: 'Closed',   variant: 'slate' },
};

interface ObjectiveStatusBadgeProps {
  status: ObjectiveStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ObjectiveStatusBadge({
  status,
  size = 'md',
  className,
}: ObjectiveStatusBadgeProps) {
  const { label, variant } = STATUS_MAP[status] ?? { label: status, variant: 'slate' };
  return (
    <Badge variant={variant} dot size={size} className={className}>
      {label}
    </Badge>
  );
}
