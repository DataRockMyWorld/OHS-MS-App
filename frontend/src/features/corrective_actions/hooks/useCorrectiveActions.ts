import { useQuery } from '@tanstack/react-query';
import { correctiveActionsApi } from '../api/correctiveActionsApi';
import type { CAFilters } from '../types/ca.types';

// ─── Query key factory ────────────────────────────────────────────────────────

export const caKeys = {
  all: ['corrective-actions'] as const,
  lists: () => [...caKeys.all, 'list'] as const,
  list: (filters: CAFilters) => [...caKeys.lists(), filters] as const,
  details: () => [...caKeys.all, 'detail'] as const,
  detail: (id: string) => [...caKeys.details(), id] as const,
  stats: () => [...caKeys.all, 'stats'] as const,
  history: (id: string) => [...caKeys.all, 'history', id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useCorrectiveActions(filters?: CAFilters) {
  return useQuery({
    queryKey: caKeys.list(filters ?? {}),
    queryFn: () => correctiveActionsApi.list(filters),
  });
}

export function useCorrectiveAction(id: string) {
  return useQuery({
    queryKey: caKeys.detail(id),
    queryFn: () => correctiveActionsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCAStats() {
  return useQuery({
    queryKey: caKeys.stats(),
    queryFn: () => correctiveActionsApi.getStats(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCAHistory(id: string) {
  return useQuery({
    queryKey: caKeys.history(id),
    queryFn: () => correctiveActionsApi.getHistory(id),
    enabled: Boolean(id),
  });
}
