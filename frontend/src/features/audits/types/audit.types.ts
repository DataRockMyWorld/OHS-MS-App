export type AuditType =
  | 'internal'
  | 'external'
  | 'surveillance'
  | 'certification'
  | 'inspection'
  | 'management_review';

export type AuditStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export type FindingSeverity = 'observation' | 'minor_nc' | 'major_nc' | 'opportunity';
export type FindingStatus = 'open' | 'raised' | 'closed';

export const AUDIT_TYPE_LABELS: Record<AuditType, string> = {
  internal: 'Internal Audit',
  external: 'External Audit',
  surveillance: 'Surveillance',
  certification: 'Certification',
  inspection: 'Inspection',
  management_review: 'Management Review',
};

export const AUDIT_STATUS_LABELS: Record<AuditStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const FINDING_SEVERITY_LABELS: Record<FindingSeverity, string> = {
  observation: 'Observation',
  minor_nc: 'Minor NC',
  major_nc: 'Major NC',
  opportunity: 'Opportunity',
};

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  severity_display: string;
  status: FindingStatus;
  status_display: string;
  clause_reference: string;
  evidence: string;
  recommended_action: string;
  ca_reference: string | null;
  ca_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditListItem {
  id: string;
  reference_number: string;
  title: string;
  audit_type: AuditType;
  audit_type_display: string;
  status: AuditStatus;
  status_display: string;
  planned_date: string;
  actual_date: string | null;
  department_name: string | null;
  location: string;
  lead_auditor_name: string | null;
  finding_count: number;
  open_finding_count: number;
}

export interface Audit {
  id: string;
  reference_number: string;
  title: string;
  audit_type: AuditType;
  audit_type_display: string;
  status: AuditStatus;
  status_display: string;
  scope: string;
  objectives: string;
  criteria: string;
  planned_date: string;
  actual_date: string | null;
  department: string | null;
  department_name: string | null;
  location: string;
  lead_auditor: string | null;
  lead_auditor_detail: { id: string; full_name: string; email: string } | null;
  auditee: string;
  summary: string;
  overall_conclusion: string;
  completed_at: string | null;
  findings: AuditFinding[];
  created_at: string;
  updated_at: string;
}

export interface CreateAuditPayload {
  title: string;
  audit_type: AuditType;
  scope?: string;
  objectives?: string;
  criteria?: string;
  planned_date: string;
  actual_date?: string | null;
  department?: string | null;
  location?: string;
  lead_auditor?: string | null;
  auditee?: string;
}

export interface CreateFindingPayload {
  title: string;
  description?: string;
  severity: FindingSeverity;
  clause_reference?: string;
  evidence?: string;
  recommended_action?: string;
}
