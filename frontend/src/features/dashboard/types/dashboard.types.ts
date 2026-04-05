export interface DashboardKPIs {
  incidents_this_month: number;
  near_miss_this_month: number;
  lti_count: number;
  open_incidents: number;
  critical_open: number;
  open_investigations: number;
  overdue_actions: number;
  pending_reviews: number;
}

export interface TrendPoint {
  period: string;  // "2025-10"
  label: string;   // "Oct"
  total: number;
  near_miss: number;
  injury: number;
}

export interface IncidentByType {
  type: string;
  label: string;
  count: number;
}

export interface RecentOpenIncident {
  id: string;
  reference_number: string;
  title: string;
  severity: string;
  status: string;
  status_display: string;
  date_of_incident: string;
  reported_by: string;
  days_open: number;
}

export interface OverdueAction {
  id: string;
  reference_number: string;
  title: string;
  priority: string;
  status: string;
  target_date: string;
  days_overdue: number;
  assigned_to: string | null;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  incident_trend: TrendPoint[];
  incidents_by_type: IncidentByType[];
  recent_open_incidents: RecentOpenIncident[];
  overdue_actions: OverdueAction[];
}
