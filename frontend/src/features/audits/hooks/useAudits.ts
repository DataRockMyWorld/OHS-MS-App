import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';
import type { CreateAuditPayload, CreateFindingPayload } from '../types/audit.types';

export function useAudits(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['audits', params],
    queryFn: () => auditApi.list(params),
    staleTime: 30_000,
  });
}

export function useAudit(id: string) {
  return useQuery({
    queryKey: ['audits', id],
    queryFn: () => auditApi.get(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useCreateAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAuditPayload) => auditApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audits'] }),
  });
}

export function useUpdateAudit(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateAuditPayload>) => auditApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['audits', id] });
      qc.invalidateQueries({ queryKey: ['audits'] });
    },
  });
}

export function useCompleteAudit(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { summary?: string; overall_conclusion?: string }) =>
      auditApi.complete(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['audits', id] });
      qc.invalidateQueries({ queryKey: ['audits'] });
    },
  });
}

export function useAddFinding(auditId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFindingPayload) => auditApi.addFinding(auditId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audits', auditId] }),
  });
}

export function useUpdateFinding(auditId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ findingId, payload }: { findingId: string; payload: Partial<CreateFindingPayload> }) =>
      auditApi.updateFinding(auditId, findingId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audits', auditId] }),
  });
}

export function useDeleteFinding(auditId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (findingId: string) => auditApi.deleteFinding(auditId, findingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audits', auditId] }),
  });
}

export function useRaiseCA(auditId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (findingId: string) => auditApi.raiseCA(auditId, findingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audits', auditId] }),
  });
}
