import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import type { InvestigationStatus } from '../types/investigation.types';

const STATUS_MAP: Record<InvestigationStatus, { label: string; variant: BadgeVariant }> = {
  initiated:              { label: 'Initiated',              variant: 'blue'   },
  in_progress:            { label: 'In Progress',            variant: 'amber'  },
  findings_recorded:      { label: 'Findings Recorded',      variant: 'orange' },
  recommendations_issued: { label: 'Recommendations Issued', variant: 'teal'   },
  closed:                 { label: 'Closed',                 variant: 'slate'  },
};

interface Props {
  status: InvestigationStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function InvestigationStatusBadge({ status, size = 'md', className }: Props) {
  const { label, variant } = STATUS_MAP[status] ?? { label: status, variant: 'slate' };
  return (
    <Badge variant={variant} dot size={size} className={className}>
      {label}
    </Badge>
  );
}
