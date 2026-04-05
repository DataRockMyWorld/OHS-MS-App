import { useQuery } from '@tanstack/react-query';
import { incidentsApi } from '../api/incidentsApi';
import type { IncidentFilters } from '../types/incident.types';

// ─── Query key factory ────────────────────────────────────────────────────────

export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: (filters: IncidentFilters) => [...incidentKeys.lists(), filters] as const,
  details: () => [...incidentKeys.all, 'detail'] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
  stats: () => [...incidentKeys.all, 'stats'] as const,
  history: (id: string) => [...incidentKeys.all, 'history', id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useIncidents(filters?: IncidentFilters) {
  return useQuery({
    queryKey: incidentKeys.list(filters ?? {}),
    queryFn: () => incidentsApi.list(filters),
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => incidentsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useIncidentStats() {
  return useQuery({
    queryKey: incidentKeys.stats(),
    queryFn: () => incidentsApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useIncidentHistory(id: string) {
  return useQuery({
    queryKey: incidentKeys.history(id),
    queryFn: () => incidentsApi.getHistory(id),
    enabled: Boolean(id),
  });
}
