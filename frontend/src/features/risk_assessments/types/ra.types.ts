import type { UserMinimal } from '@/features/incidents/types/incident.types';

export type AssessmentStatus = 'draft' | 'active' | 'under_review' | 'archived';
export type HazardCategory =
  | 'physical' | 'chemical' | 'biological' | 'ergonomic'
  | 'psychosocial' | 'electrical' | 'fire' | 'environmental'
  | 'mechanical' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  under_review: 'Under Review',
  archived: 'Archived',
};

export const HAZARD_CATEGORY_LABELS: Record<HazardCategory, string> = {
  physical: 'Physical',
  chemical: 'Chemical',
  biological: 'Biological',
  ergonomic: 'Ergonomic',
  psychosocial: 'Psychosocial',
  electrical: 'Electrical',
  fire: 'Fire & Explosion',
  environmental: 'Environmental',
  mechanical: 'Mechanical',
  other: 'Other',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  low:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200' },
  medium:   { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200'   },
  high:     { bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200'  },
  critical: { bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200'     },
};

export interface Hazard {
  id: string;
  hazard_description: string;
  hazard_category: HazardCategory;
  hazard_category_display: string;
  who_is_at_risk: string;
  existing_controls: string;
  likelihood_before: number;
  consequence_before: number;
  risk_rating_before: number;
  risk_level_before: RiskLevel;
  risk_level_before_display: string;
  additional_controls: string;
  responsible_person: string | null;
  responsible_person_detail: UserMinimal | null;
  target_date: string | null;
  likelihood_after: number | null;
  consequence_after: number | null;
  risk_rating_after: number | null;
  risk_level_after: RiskLevel | null;
  risk_level_after_display: string | null;
  created_at: string;
  updated_at: string;
}

export interface HazardAssessmentListItem {
  id: string;
  reference_number: string;
  title: string;
  work_area: string;
  department_name: string | null;
  status: AssessmentStatus;
  status_display: string;
  assessment_date: string;
  next_review_date: string | null;
  assessed_by_detail: UserMinimal;
  reviewed_by_detail: UserMinimal | null;
  hazard_count: number;
  critical_hazard_count: number;
  high_hazard_count: number;
  created_at: string;
}

export interface HazardAssessment extends HazardAssessmentListItem {
  description: string;
  department: string | null;
  assessed_by: string;
  reviewed_by: string | null;
  hazards: Hazard[];
  updated_at: string;
}

export interface CreateAssessmentPayload {
  title: string;
  description?: string;
  work_area?: string;
  department?: string | null;
  assessment_date: string;
  next_review_date?: string | null;
  assessed_by: string;
  reviewed_by?: string | null;
}

export interface CreateHazardPayload {
  hazard_description: string;
  hazard_category: HazardCategory;
  who_is_at_risk?: string;
  existing_controls?: string;
  likelihood_before: number;
  consequence_before: number;
  additional_controls?: string;
  responsible_person?: string | null;
  target_date?: string | null;
  likelihood_after?: number | null;
  consequence_after?: number | null;
}
