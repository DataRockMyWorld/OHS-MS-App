import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import type { IncidentSeverity } from '../types/incident.types';

const SEVERITY_MAP: Record<IncidentSeverity, { label: string; variant: BadgeVariant }> = {
  low:      { label: 'Low',      variant: 'green'  },
  medium:   { label: 'Medium',   variant: 'yellow' },
  high:     { label: 'High',     variant: 'orange' },
  critical: { label: 'Critical', variant: 'red'    },
};

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  size?: 'sm' | 'md';
  className?: string;
}

export default function SeverityBadge({ severity, size = 'md', className }: SeverityBadgeProps) {
  const { label, variant } = SEVERITY_MAP[severity] ?? { label: severity, variant: 'slate' };
  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  );
}
