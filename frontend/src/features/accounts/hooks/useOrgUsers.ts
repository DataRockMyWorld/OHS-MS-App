import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import type { UserMinimal } from '@/features/incidents/types/incident.types';

async function getOrgUsers(): Promise<UserMinimal[]> {
  const { data } = await apiClient.get<UserMinimal[]>('/users/');
  return data;
}

export function useOrgUsers() {
  return useQuery({
    queryKey: ['org-users'],
    queryFn: getOrgUsers,
    staleTime: 5 * 60_000, // 5 min — user list changes rarely
  });
}
