import { useQuery } from '@tanstack/react-query';
import { investigationsApi } from '../api/investigationsApi';
import type { InvestigationFilters } from '../types/investigation.types';

// ─── Query key factory ────────────────────────────────────────────────────────

export const investigationKeys = {
  all: ['investigations'] as const,
  lists: () => [...investigationKeys.all, 'list'] as const,
  list: (filters: InvestigationFilters) => [...investigationKeys.lists(), filters] as const,
  details: () => [...investigationKeys.all, 'detail'] as const,
  detail: (id: string) => [...investigationKeys.details(), id] as const,
  stats: () => [...investigationKeys.all, 'stats'] as const,
  history: (id: string) => [...investigationKeys.all, 'history', id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useInvestigations(filters?: InvestigationFilters) {
  return useQuery({
    queryKey: investigationKeys.list(filters ?? {}),
    queryFn: () => investigationsApi.list(filters),
  });
}

export function useInvestigation(id: string) {
  return useQuery({
    queryKey: investigationKeys.detail(id),
    queryFn: () => investigationsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useInvestigationStats() {
  return useQuery({
    queryKey: investigationKeys.stats(),
    queryFn: () => investigationsApi.getStats(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInvestigationHistory(id: string) {
  return useQuery({
    queryKey: investigationKeys.history(id),
    queryFn: () => investigationsApi.getHistory(id),
    enabled: Boolean(id),
  });
}
