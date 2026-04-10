export type ObjectiveScope = 'organizational' | 'individual';
export type EffectivenessDecision = 'pending' | 'effective' | 'partially_effective' | 'not_effective';
export type ObjectiveDirection = 'increase' | 'decrease' | 'maintain';
export type ObjectiveFrequency = 'monthly' | 'quarterly' | 'bi_annually';
export type ObjectiveStatus = 'on_track' | 'at_risk' | 'behind' | 'achieved' | 'closed';
export type ObjectiveCategory = 'lagging' | 'leading';
export type LinkedMetric =
  | 'manual'
  | 'near_miss_count'
  | 'total_incident_count'
  | 'injury_count'
  | 'critical_incident_count'
  | 'open_incident_count'
  | 'overdue_ca_count'
  | 'ca_closure_rate'
  | 'open_investigation_count';

export interface KPIMeasurement {
  id: string;
  value: string; // decimal as string from DRF
  measured_at: string;
  notes: string;
  is_auto_computed: boolean;
  recorded_by_name: string | null;
  created_at: string;
}

export interface ObjectiveListItem {
  id: string;
  title: string;
  scope: ObjectiveScope;
  category: ObjectiveCategory;
  unit: string;
  direction: ObjectiveDirection;
  measurement_frequency: ObjectiveFrequency;
  linked_metric: LinkedMetric;
  kpi_description: string;
  baseline_value: string;
  target_value: string;
  current_value: string | null;
  status: ObjectiveStatus;
  start_date: string;
  target_date: string;
  owner_id: string | null;
  owner_name: string | null;
  weight: number;
  achievement_pct: number | null;
  effectiveness_decision: EffectivenessDecision;
  created_at: string;
}

export interface ObjectiveDetail extends ObjectiveListItem {
  description: string;
  // Planning
  present_status: string;
  planned_actions: string;
  responsible_persons: string;
  expected_result: string;
  // Review
  effectiveness_notes: string;
  evidence_of_review: string;
  final_result: string;
  review_date: string | null;
  reviewed_by_id: string | null;
  reviewed_by_name: string | null;
  // Meta
  created_by_name: string | null;
  measurements: KPIMeasurement[];
  risk_or_opportunity_id: string | null;
  risk_or_opportunity_title: string | null;
  risk_or_opportunity_type: 'risk' | 'opportunity' | null;
}

export interface ObjectiveStats {
  total: number;
  on_track: number;
  at_risk: number;
  behind: number;
  achieved: number;
  individual_count: number;
  organizational_count: number;
}

export interface LeagueTableEntry {
  user_id: string;
  full_name: string;
  email: string;
  job_title: string | null;
  score: number | null;
  objective_count: number;
  on_track: number;
  at_risk: number;
  behind: number;
  achieved: number;
}

export interface ComputeMetricResult {
  suggested_value: string;
  metric: string;
  period_start: string;
  period_end: string;
}

export interface CreateObjectivePayload {
  title: string;
  description?: string;
  scope: ObjectiveScope;
  category: ObjectiveCategory;
  unit: string;
  direction: ObjectiveDirection;
  measurement_frequency: ObjectiveFrequency;
  linked_metric: LinkedMetric;
  kpi_description?: string;
  baseline_value: number;
  target_value: number;
  weight?: number;
  start_date: string;
  target_date: string;
  owner?: string | null;
  risk_or_opportunity?: string | null;
  // Planning
  present_status?: string;
  planned_actions?: string;
  responsible_persons?: string;
  expected_result?: string;
}

export interface CreateMeasurementPayload {
  value: number;
  measured_at: string;
  notes?: string;
  is_auto_computed?: boolean;
}
