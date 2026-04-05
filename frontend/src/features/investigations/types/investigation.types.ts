// ─── Enums ────────────────────────────────────────────────────────────────────

export type InvestigationStatus =
  | 'initiated'
  | 'in_progress'
  | 'findings_recorded'
  | 'recommendations_issued'
  | 'closed';

export type RCAMethod =
  | 'five_whys'
  | 'fishbone'
  | 'fault_tree'
  | 'bow_tie'
  | 'icam'
  | 'other';

export type RootCauseCategory =
  | 'human_factors'
  | 'equipment_failure'
  | 'environmental'
  | 'management_system'
  | 'procedure'
  | 'training'
  | 'communication'
  | 'design'
  | 'external'
  | 'other';

// ─── Reference data ───────────────────────────────────────────────────────────

export const INVESTIGATION_STATUS_LABELS: Record<InvestigationStatus, string> = {
  initiated:              'Initiated',
  in_progress:            'In Progress',
  findings_recorded:      'Findings Recorded',
  recommendations_issued: 'Recommendations Issued',
  closed:                 'Closed',
};

export const RCA_METHOD_LABELS: Record<RCAMethod, string> = {
  five_whys:  '5 Whys',
  fishbone:   'Fishbone (Ishikawa)',
  fault_tree: 'Fault Tree Analysis',
  bow_tie:    'Bow Tie Analysis',
  icam:       'ICAM',
  other:      'Other',
};

export const ROOT_CAUSE_CATEGORY_LABELS: Record<RootCauseCategory, string> = {
  human_factors:     'Human Factors',
  equipment_failure: 'Equipment / Plant Failure',
  environmental:     'Environmental Conditions',
  management_system: 'Management System Deficiency',
  procedure:         'Procedure / Process Deficiency',
  training:          'Training / Competency Deficiency',
  communication:     'Communication Failure',
  design:            'Design Deficiency',
  external:          'External / Uncontrollable',
  other:             'Other',
};

export const VALID_INVESTIGATION_STATUS_TRANSITIONS: Record<InvestigationStatus, InvestigationStatus[]> = {
  initiated:              ['in_progress'],
  in_progress:            ['findings_recorded'],
  findings_recorded:      ['recommendations_issued', 'in_progress'],
  recommendations_issued: ['closed'],
  closed:                 ['initiated'],
};

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface UserMinimal {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  role: string;
}

export interface IncidentStub {
  id: string;
  reference_number: string;
  title: string;
  severity: string;
  date_of_incident: string;
}

export interface RootCause {
  id: string;
  category: RootCauseCategory;
  category_display: string;
  description: string;
  why_analysis: string[];
  order: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user: UserMinimal;
  added_at: string;
}

export interface InvestigationStatusHistory {
  id: string;
  from_status: string;
  from_status_display: string;
  to_status: InvestigationStatus;
  to_status_display: string;
  changed_by: UserMinimal;
  comment: string;
  created_at: string;
}

export interface InvestigationListItem {
  id: string;
  reference_number: string;
  title: string;
  status: InvestigationStatus;
  status_display: string;
  rca_method: RCAMethod | null;
  rca_method_display: string;
  lead_investigator: UserMinimal | null;
  incident_reference: string | null;
  incident_title: string | null;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  allowed_transitions: InvestigationStatus[];
  root_cause_count: number;
  is_overdue: boolean;
  created_at: string;
}

export interface Investigation extends InvestigationListItem {
  created_by: UserMinimal;
  closed_by: UserMinimal | null;
  closed_at: string | null;
  incident: IncidentStub | null;
  scope: string;
  timeline_of_events: string;
  immediate_causes: string;
  contributing_factors: string;
  findings: string;
  lessons_learned: string;
  recommendations: string;
  root_causes: RootCause[];
  team_memberships: TeamMember[];
  status_history: InvestigationStatusHistory[];
  updated_at: string;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateInvestigationPayload {
  title: string;
  incident?: string | null;
  rca_method?: RCAMethod | null;
  lead_investigator: string;
  scope?: string;
  target_completion_date?: string | null;
}

export interface UpdateInvestigationPayload {
  title?: string;
  rca_method?: RCAMethod | null;
  lead_investigator?: string;
  scope?: string;
  timeline_of_events?: string;
  immediate_causes?: string;
  contributing_factors?: string;
  findings?: string;
  lessons_learned?: string;
  recommendations?: string;
  target_completion_date?: string | null;
}

export interface TransitionInvestigationPayload {
  new_status: InvestigationStatus;
  comment?: string;
}

export interface AddTeamMemberPayload {
  user_id: string;
}

export interface CreateRootCausePayload {
  category: RootCauseCategory;
  description: string;
  why_analysis?: string[];
  order?: number;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface InvestigationStats {
  total: number;
  this_month: number;
  open_count: number;
  in_progress_count: number;
  closed_count: number;
  overdue_count: number;
}

// ─── Filters / pagination ─────────────────────────────────────────────────────

export interface InvestigationFilters {
  status?: InvestigationStatus[];
  rca_method?: RCAMethod[];
  lead_investigator?: string;
  incident?: string;
  date_from?: string;
  date_to?: string;
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
