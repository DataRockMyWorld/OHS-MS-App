import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  getIssueStats,
} from '../api/contextApi';
import type { CreateIssuePayload } from '../types/context.types';

export function useContextIssues(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['context-issues', filters],
    queryFn: () => getIssues(filters),
    staleTime: 30_000,
  });
}

export function useContextIssue(id: string) {
  return useQuery({
    queryKey: ['context-issue', id],
    queryFn: () => getIssue(id),
    enabled: !!id,
  });
}

export function useIssueStats() {
  return useQuery({
    queryKey: ['context-issue-stats'],
    queryFn: getIssueStats,
    staleTime: 60_000,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIssuePayload) => createIssue(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['context-issues'] });
      qc.invalidateQueries({ queryKey: ['context-issue-stats'] });
    },
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateIssuePayload> }) =>
      updateIssue(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['context-issues'] });
      qc.invalidateQueries({ queryKey: ['context-issue', id] });
      qc.invalidateQueries({ queryKey: ['context-issue-stats'] });
    },
  });
}
