import apiClient from '@/lib/axios';
import type { SafetyMetricsReport, ReportFilters } from '../types/reports.types';

export const reportsApi = {
  getMetrics: (filters: ReportFilters) =>
    apiClient
      .get<SafetyMetricsReport>('/reports/metrics/', { params: filters })
      .then((r) => r.data),
};
