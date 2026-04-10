import apiClient from '@/lib/axios';
import type { Audit, AuditListItem, AuditFinding, CreateAuditPayload, CreateFindingPayload } from '../types/audit.types';

export const auditApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<AuditListItem[]>('/audits/', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Audit>(`/audits/${id}/`).then((r) => r.data),

  create: (payload: CreateAuditPayload) =>
    apiClient.post<Audit>('/audits/', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateAuditPayload>) =>
    apiClient.patch<Audit>(`/audits/${id}/`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/audits/${id}/`),

  complete: (id: string, data: { summary?: string; overall_conclusion?: string }) =>
    apiClient.post<Audit>(`/audits/${id}/complete/`, data).then((r) => r.data),

  listFindings: (auditId: string) =>
    apiClient.get<AuditFinding[]>(`/audits/${auditId}/findings/`).then((r) => r.data),

  addFinding: (auditId: string, payload: CreateFindingPayload) =>
    apiClient.post<AuditFinding>(`/audits/${auditId}/findings/`, payload).then((r) => r.data),

  updateFinding: (auditId: string, findingId: string, payload: Partial<CreateFindingPayload>) =>
    apiClient.patch<AuditFinding>(`/audits/${auditId}/findings/${findingId}/`, payload).then((r) => r.data),

  deleteFinding: (auditId: string, findingId: string) =>
    apiClient.delete(`/audits/${auditId}/findings/${findingId}/`),

  raiseCA: (auditId: string, findingId: string) =>
    apiClient.post<{ ca_id: string; ca_reference: string; finding_id: string }>(
      `/audits/${auditId}/findings/${findingId}/raise-ca/`
    ).then((r) => r.data),
};
