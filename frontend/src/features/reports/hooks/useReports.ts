import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reportsApi';
import type { ReportFilters } from '../types/reports.types';

export function useSafetyMetrics(filters: ReportFilters) {
  return useQuery({
    queryKey: ['safety-metrics', filters],
    queryFn: () => reportsApi.getMetrics(filters),
    staleTime: 5 * 60_000,
    enabled: !!filters.from && !!filters.to,
  });
}
