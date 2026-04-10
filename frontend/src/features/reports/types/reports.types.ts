export interface SafetyKPIs {
  total_incidents: number;
  lti_count: number;
  fatality_count: number;
  near_miss_count: number;
  recordable_count: number;
  critical_count: number;
  high_count: number;
  ltifr: number | null;
  trifr: number | null;
}

export interface MonthlyTrendPoint {
  period: string;
  label: string;
  total: number;
  lti: number;
  near_miss: number;
  recordable: number;
}

export interface BreakdownItem {
  incident_type?: string;
  severity?: string;
  count: number;
}

export interface CAMetrics {
  total: number;
  closed: number;
  overdue: number;
  closure_rate: number;
}

export interface InvestigationMetrics {
  total: number;
  closed: number;
  closure_rate: number;
}

export interface SafetyMetricsReport {
  period: { from: string; to: string };
  hours_worked: number | null;
  kpis: SafetyKPIs;
  by_type: BreakdownItem[];
  by_severity: BreakdownItem[];
  monthly_trend: MonthlyTrendPoint[];
  ca_metrics: CAMetrics;
  investigation_metrics: InvestigationMetrics;
}

export interface ReportFilters {
  from: string;
  to: string;
  hours_worked?: string;
}
