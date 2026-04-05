import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getObjectives, getObjectiveStats, createObjective } from '../api/objectivesApi';
import type { CreateObjectivePayload } from '../types/objective.types';

interface ObjectiveFilters {
  scope?: string;
  status?: string;
  owner?: string;
}

export function useObjectives(filters?: ObjectiveFilters) {
  return useQuery({
    queryKey: ['objectives', filters ?? {}],
    queryFn: () => getObjectives(filters),
    staleTime: 30_000,
  });
}

export function useObjectiveStats() {
  return useQuery({
    queryKey: ['objective-stats'],
    queryFn: getObjectiveStats,
    staleTime: 60_000,
  });
}

export function useCreateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateObjectivePayload) => createObjective(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objective-stats'] });
    },
  });
}
