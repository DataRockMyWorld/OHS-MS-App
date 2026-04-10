import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRisksOpportunities,
  getRiskOpportunity,
  createRiskOpportunity,
  updateRiskOpportunity,
  getRoStats,
} from '../api/contextApi';
import type { CreateROPayload } from '../types/context.types';

export function useRisksOpportunities(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['risks-opportunities', filters],
    queryFn: () => getRisksOpportunities(filters),
    staleTime: 30_000,
  });
}

export function useRiskOpportunity(id: string) {
  return useQuery({
    queryKey: ['risk-opportunity', id],
    queryFn: () => getRiskOpportunity(id),
    enabled: !!id,
  });
}

export function useRoStats() {
  return useQuery({
    queryKey: ['ro-stats'],
    queryFn: getRoStats,
    staleTime: 60_000,
  });
}

export function useCreateRiskOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateROPayload) => createRiskOpportunity(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risks-opportunities'] });
      qc.invalidateQueries({ queryKey: ['ro-stats'] });
    },
  });
}

export function useUpdateRiskOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateROPayload> }) =>
      updateRiskOpportunity(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['risks-opportunities'] });
      qc.invalidateQueries({ queryKey: ['risk-opportunity', id] });
      qc.invalidateQueries({ queryKey: ['ro-stats'] });
    },
  });
}
