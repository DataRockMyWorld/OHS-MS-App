export interface ManagementSystemScope {
  id: number;
  scope_statement: string;
  boundaries_and_applicability: string;
  activities_products_services: string;
  exclusions: string;
  updated_by_name: string | null;
  updated_at: string;
}

export interface UpdateScopePayload {
  scope_statement: string;
  boundaries_and_applicability?: string;
  activities_products_services?: string;
  exclusions?: string;
}

export type IssueType = 'internal' | 'external';
export type AnalysisTag =
  | 'swot_strength'
  | 'swot_weakness'
  | 'swot_opportunity'
  | 'swot_threat'
  | 'pestle_political'
  | 'pestle_economic'
  | 'pestle_social'
  | 'pestle_technological'
  | 'pestle_legal'
  | 'pestle_environmental'
  | 'other';
export type IssueClassification = 'risk' | 'opportunity';
export type IssueStatus = 'open' | 'monitored' | 'addressed' | 'closed';
export type PartyType =
  | 'worker'
  | 'contractor'
  | 'regulator'
  | 'supplier'
  | 'customer'
  | 'community'
  | 'investor'
  | 'other';
export type PartyCategory = 'internal' | 'external';
export type ReviewFrequency = 'annually' | 'semi_annually' | 'quarterly';
export type PartyStatus = 'active' | 'inactive';
export type ROType = 'risk' | 'opportunity';
export type SeverityLevel = 'high' | 'medium' | 'low';
export type ROStatus = 'open' | 'being_addressed' | 'closed';

export interface InterestedParty {
  id: string;
  name: string;
  category: PartyCategory;
  party_type: PartyType;
  needs_and_expectations: string;
  is_compliance_obligation: boolean;
  review_frequency: ReviewFrequency;
  last_reviewed_date: string | null;
  status: PartyStatus;
  created_at: string;
  updated_at: string;
}

export interface ContextIssue {
  id: string;
  title: string;
  description?: string;
  category: IssueType;
  analysis_tag: AnalysisTag;
  classification: IssueClassification;
  status: IssueStatus;
  identified_date: string;
  identified_by: string | null;
  identified_by_name: string | null;
  interested_party: string | null;
  interested_party_name: string | null;
  ro_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface RiskOrOpportunity {
  id: string;
  type: ROType;
  title: string;
  description?: string;
  source_issue: string | null;
  source_issue_title: string | null;
  severity_level: SeverityLevel;
  controls: string;
  potential_benefit: string;
  owner: string | null;
  owner_name: string | null;
  status: ROStatus;
  linked_objectives_count: number;
  created_at: string;
  updated_at?: string;
}

export interface IssueStats {
  total: number;
  risks: number;
  opportunities: number;
  open: number;
  monitored: number;
  addressed: number;
  internal: number;
  external: number;
}

export interface ROStats {
  total: number;
  risks_count: number;
  opportunities_count: number;
  open_count: number;
  high_severity: number;
  medium_severity: number;
  low_severity: number;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  category: IssueType;
  analysis_tag: AnalysisTag;
  classification: IssueClassification;
  interested_party?: string | null;
  status?: IssueStatus;
  identified_date: string;
  identified_by?: string | null;
}

export interface CreateInterestedPartyPayload {
  name: string;
  category: PartyCategory;
  party_type: PartyType;
  needs_and_expectations: string;
  is_compliance_obligation: boolean;
  review_frequency: ReviewFrequency;
  last_reviewed_date?: string | null;
}

export interface CreateROPayload {
  type: ROType;
  title: string;
  description: string;
  source_issue?: string | null;
  severity_level: SeverityLevel;
  controls?: string;
  potential_benefit?: string;
  owner?: string | null;
  status?: ROStatus;
}
