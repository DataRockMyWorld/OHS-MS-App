// ─── Enums ────────────────────────────────────────────────────────────────────

export type CAStatus =
  | 'open'
  | 'in_progress'
  | 'implemented'
  | 'closed'
  | 'reopened';

export type CAPriority = 'low' | 'medium' | 'high' | 'critical';
export type CAType = 'corrective' | 'preventive' | 'improvement';
export type CASource =
  | 'investigation'
  | 'incident'
  | 'audit'
  | 'risk_assessment'
  | 'management_review'
  | 'other';

export type EffectivenessRating =
  | 'fully_effective'
  | 'partially_effective'
  | 'not_effective';

// ─── Reference data ───────────────────────────────────────────────────────────

export const CA_STATUS_LABELS: Record<CAStatus, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  implemented: 'Implemented — Awaiting Review',
  closed:      'Closed',
  reopened:    'Reopened',
};

export const CA_PRIORITY_LABELS: Record<CAPriority, string> = {
  low:      'Low',
  medium:   'Medium',
  high:     'High',
  critical: 'Critical',
};

export const CA_TYPE_LABELS: Record<CAType, string> = {
  corrective:  'Corrective',
  preventive:  'Preventive',
  improvement: 'Improvement Opportunity',
};

export const CA_SOURCE_LABELS: Record<CASource, string> = {
  investigation:     'Investigation',
  incident:          'Incident',
  audit:             'Audit',
  risk_assessment:   'Risk Assessment',
  management_review: 'Management Review',
  other:             'Other',
};

export const EFFECTIVENESS_RATING_LABELS: Record<EffectivenessRating, string> = {
  fully_effective:    'Fully Effective',
  partially_effective: 'Partially Effective',
  not_effective:      'Not Effective',
};

export const VALID_CA_STATUS_TRANSITIONS: Record<CAStatus, CAStatus[]> = {
  open:        ['in_progress'],
  in_progress: ['implemented'],
  implemented: ['closed', 'in_progress'],
  closed:      ['reopened'],
  reopened:    ['in_progress'],
};

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface UserMinimal {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  role: string;
}

export interface InvestigationStub {
  id: string;
  reference_number: string;
  title: string;
}

export interface IncidentStub {
  id: string;
  reference_number: string;
  title: string;
}

export interface EffectivenessReview {
  id: string;
  reviewer: UserMinimal;
  review_date: string;
  rating: EffectivenessRating;
  rating_display: string;
  evidence_description: string;
  notes: string;
  next_review_date: string | null;
  created_at: string;
}

export interface CAStatusHistory {
  id: string;
  from_status: string;
  from_status_display: string;
  to_status: CAStatus;
  to_status_display: string;
  changed_by: UserMinimal;
  comment: string;
  created_at: string;
}

export interface CAListItem {
  id: string;
  reference_number: string;
  title: string;
  action_type: CAType;
  action_type_display: string;
  priority: CAPriority;
  priority_display: string;
  status: CAStatus;
  status_display: string;
  source_type: CASource;
  source_type_display: string;
  source_investigation_reference: string | null;
  source_incident_reference: string | null;
  assigned_to: UserMinimal | null;
  target_date: string | null;
  implementation_date: string | null;
  allowed_transitions: CAStatus[];
  is_overdue: boolean;
  effectiveness_review_count: number;
  created_at: string;
}

export interface CorrectiveAction extends CAListItem {
  description: string;
  planned_action: string;
  implementation_notes: string;
  implementation_evidence: string;
  source_investigation: InvestigationStub | null;
  source_incident: IncidentStub | null;
  created_by: UserMinimal;
  closed_by: UserMinimal | null;
  closed_at: string | null;
  effectiveness_reviews: EffectivenessReview[];
  status_history: CAStatusHistory[];
  updated_at: string;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateCAPayload {
  title: string;
  description?: string;
  action_type: CAType;
  priority: CAPriority;
  source_type: CASource;
  source_investigation?: string | null;
  source_incident?: string | null;
  assigned_to?: string | null;
  planned_action?: string;
  target_date?: string | null;
}

export interface UpdateCAPayload {
  title?: string;
  description?: string;
  action_type?: CAType;
  priority?: CAPriority;
  assigned_to?: string | null;
  planned_action?: string;
  implementation_notes?: string;
  implementation_evidence?: string;
  target_date?: string | null;
  implementation_date?: string | null;
}

export interface TransitionCAPayload {
  new_status: CAStatus;
  comment?: string;
}

export interface CreateEffectivenessReviewPayload {
  review_date: string;
  rating: EffectivenessRating;
  evidence_description?: string;
  notes?: string;
  next_review_date?: string | null;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface CAStats {
  total: number;
  this_month: number;
  open_count: number;
  pending_review_count: number;
  closed_count: number;
  overdue_count: number;
}

// ─── Filters / pagination ─────────────────────────────────────────────────────

export interface CAFilters {
  status?: CAStatus[];
  priority?: CAPriority[];
  action_type?: CAType[];
  source_type?: CASource[];
  assigned_to?: string;
  source_investigation?: string;
  source_incident?: string;
  overdue?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
