import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboardApi';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: getDashboard,
    staleTime: 60_000, // 1 minute — dashboard data is near-realtime but not live
  });
}
