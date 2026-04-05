// ─── Enums ────────────────────────────────────────────────────────────────────

export type IncidentType =
  | 'near_miss'
  | 'injury'
  | 'first_aid'
  | 'medical_treatment'
  | 'lost_time_injury'
  | 'fatality'
  | 'property_damage'
  | 'environmental_spill'
  | 'unsafe_act'
  | 'unsafe_condition'
  | 'fire'
  | 'vehicle_incident'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'draft'
  | 'reported'
  | 'under_review'
  | 'investigation_ongoing'
  | 'actions_implemented'
  | 'closed'
  | 'reopened';

// ─── Reference data ───────────────────────────────────────────────────────────

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  near_miss: 'Near Miss',
  injury: 'Injury',
  first_aid: 'First Aid Case',
  medical_treatment: 'Medical Treatment Case',
  lost_time_injury: 'Lost Time Injury',
  fatality: 'Fatality',
  property_damage: 'Property Damage',
  environmental_spill: 'Environmental Spill',
  unsafe_act: 'Unsafe Act',
  unsafe_condition: 'Unsafe Condition',
  fire: 'Fire',
  vehicle_incident: 'Vehicle Incident',
  other: 'Other',
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  draft: 'Draft',
  reported: 'Reported',
  under_review: 'Under Review',
  investigation_ongoing: 'Investigation Ongoing',
  actions_implemented: 'Actions Implemented',
  closed: 'Closed',
  reopened: 'Reopened',
};

export const VALID_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  draft: ['reported'],
  reported: ['under_review'],
  under_review: ['investigation_ongoing', 'actions_implemented'],
  investigation_ongoing: ['actions_implemented', 'under_review'],
  actions_implemented: ['closed'],
  closed: ['reopened'],
  reopened: ['under_review'],
};

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface UserMinimal {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  role: string;
}

export interface IncidentAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  caption: string;
  is_photo: boolean;
  uploaded_by: UserMinimal;
  created_at: string;
}

export interface IncidentStatusHistory {
  id: string;
  from_status: string;
  from_status_display: string;
  to_status: IncidentStatus;
  to_status_display: string;
  changed_by: UserMinimal;
  comment: string;
  created_at: string;
}

export interface IncidentListItem {
  id: string;
  reference_number: string;
  title: string;
  incident_type: IncidentType;
  incident_type_display: string;
  severity: IncidentSeverity;
  severity_display: string;
  status: IncidentStatus;
  status_display: string;
  date_of_incident: string;
  report_date: string | null;
  reported_by: UserMinimal;
  assigned_to: UserMinimal | null;
  site_name: string | null;
  department_name: string | null;
  injury_occurred: boolean;
  environmental_impact: boolean;
  property_damage: boolean;
  attachment_count: number;
  allowed_transitions: IncidentStatus[];
  created_at: string;
}

export interface Incident extends Omit<IncidentListItem, 'attachment_count'> {
  time_of_incident: string | null;
  site: string | null;
  location_detail: string;
  department: string | null;
  description: string;
  persons_involved: string[];
  witnesses: string[];
  immediate_action_taken: string;
  reviewed_by: UserMinimal | null;
  reviewed_at: string | null;
  closed_by: UserMinimal | null;
  closed_at: string | null;
  closure_notes: string;
  investigation_id: string | null;
  attachments: IncidentAttachment[];
  status_history: IncidentStatusHistory[];
  updated_at: string;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateIncidentPayload {
  title: string;
  incident_type: IncidentType;
  date_of_incident: string;
  time_of_incident?: string;
  site?: string | null;
  location_detail?: string;
  department?: string | null;
  description: string;
  persons_involved?: string[];
  witnesses?: string[];
  immediate_action_taken?: string;
  injury_occurred: boolean;
  environmental_impact: boolean;
  property_damage: boolean;
  severity: IncidentSeverity;
}

export interface UpdateIncidentPayload extends Partial<CreateIncidentPayload> {
  closure_notes?: string;
}

export interface TransitionStatusPayload {
  new_status: IncidentStatus;
  comment?: string;
}

export interface AssignIncidentPayload {
  assignee_id: string;
  comment?: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface IncidentStats {
  total: number;
  this_month: number;
  open_count: number;
  under_review_count: number;
  investigation_count: number;
  closed_count: number;
  critical_count: number;
}

// ─── Filters / pagination ─────────────────────────────────────────────────────

export interface IncidentFilters {
  status?: IncidentStatus[];
  incident_type?: IncidentType[];
  severity?: IncidentSeverity[];
  date_from?: string;
  date_to?: string;
  site?: string;
  department?: string;
  reported_by?: string;
  assigned_to?: string;
  injury_occurred?: boolean;
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
