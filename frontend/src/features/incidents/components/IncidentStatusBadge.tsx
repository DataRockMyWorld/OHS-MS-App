import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import type { IncidentStatus } from '../types/incident.types';

const STATUS_MAP: Record<IncidentStatus, { label: string; variant: BadgeVariant }> = {
  draft:                 { label: 'Draft',                 variant: 'slate'  },
  reported:              { label: 'Reported',              variant: 'blue'   },
  under_review:          { label: 'Under Review',          variant: 'amber'  },
  investigation_ongoing: { label: 'Investigation Ongoing', variant: 'orange' },
  actions_implemented:   { label: 'Actions Implemented',   variant: 'teal'   },
  closed:                { label: 'Closed',                variant: 'slate'  },
  reopened:              { label: 'Reopened',              variant: 'red'    },
};

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function IncidentStatusBadge({ status, size = 'md', className }: IncidentStatusBadgeProps) {
  const { label, variant } = STATUS_MAP[status] ?? { label: status, variant: 'slate' };
  return (
    <Badge variant={variant} dot size={size} className={className}>
      {label}
    </Badge>
  );
}
