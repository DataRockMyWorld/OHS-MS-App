export type RequirementType =
  | 'legislation'
  | 'regulation'
  | 'standard'
  | 'code_of_practice'
  | 'permit'
  | 'agreement'
  | 'other';

export type Jurisdiction = 'international' | 'national' | 'state' | 'local' | 'industry';

export type ComplianceStatus =
  | 'compliant'
  | 'partially_compliant'
  | 'non_compliant'
  | 'not_assessed'
  | 'not_applicable';

export const REQUIREMENT_TYPE_LABELS: Record<RequirementType, string> = {
  legislation:      'Legislation / Act',
  regulation:       'Regulation',
  standard:         'Standard',
  code_of_practice: 'Code of Practice',
  permit:           'Permit / Licence',
  agreement:        'Agreement',
  other:            'Other',
};

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  international: 'International',
  national:      'National / Federal',
  state:         'State / Provincial',
  local:         'Local / Municipal',
  industry:      'Industry / Sector',
};

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  compliant:           'Compliant',
  partially_compliant: 'Partially Compliant',
  non_compliant:       'Non-Compliant',
  not_assessed:        'Not Yet Assessed',
  not_applicable:      'Not Applicable',
};

export interface LegalComplianceReview {
  id: string;
  review_date: string;
  compliance_status: ComplianceStatus;
  compliance_status_display: string;
  findings: string;
  evidence: string;
  next_review_date: string | null;
  reviewed_by_name: string;
  created_at: string;
}

export interface LegalRequirementListItem {
  id: string;
  reference_number: string;
  title: string;
  requirement_type: RequirementType;
  requirement_type_display: string;
  jurisdiction: Jurisdiction;
  jurisdiction_display: string;
  compliance_status: ComplianceStatus;
  compliance_status_display: string;
  department_name: string | null;
  responsible_person_name: string | null;
  effective_date: string | null;
  review_date: string | null;
  last_reviewed_date: string | null;
  is_overdue_review: boolean;
}

export interface LegalRequirement {
  id: string;
  reference_number: string;
  title: string;
  requirement_type: RequirementType;
  requirement_type_display: string;
  jurisdiction: Jurisdiction;
  jurisdiction_display: string;
  description: string;
  applicable_clauses: string;
  source_url: string;
  department: string | null;
  department_name: string | null;
  responsible_person: string | null;
  responsible_person_detail: { id: string; full_name: string; email: string } | null;
  compliance_status: ComplianceStatus;
  compliance_status_display: string;
  compliance_notes: string;
  compliance_evidence: string;
  effective_date: string | null;
  review_date: string | null;
  last_reviewed_date: string | null;
  last_reviewed_by_name: string | null;
  is_overdue_review: boolean;
  reviews: LegalComplianceReview[];
  created_at: string;
  updated_at: string;
}

export interface CreateLegalRequirementPayload {
  title: string;
  requirement_type: RequirementType;
  jurisdiction: Jurisdiction;
  description?: string;
  applicable_clauses?: string;
  source_url?: string;
  department?: string | null;
  responsible_person?: string | null;
  compliance_status?: ComplianceStatus;
  compliance_notes?: string;
  compliance_evidence?: string;
  effective_date?: string | null;
  review_date?: string | null;
}

export interface AddReviewPayload {
  review_date: string;
  compliance_status: ComplianceStatus;
  findings?: string;
  evidence?: string;
  next_review_date?: string | null;
}
