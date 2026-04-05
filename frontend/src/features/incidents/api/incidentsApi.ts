import apiClient from '@/lib/axios';
import type {
  Incident,
  IncidentListItem,
  CreateIncidentPayload,
  UpdateIncidentPayload,
  TransitionStatusPayload,
  AssignIncidentPayload,
  IncidentAttachment,
  IncidentStatusHistory,
  IncidentStats,
  IncidentFilters,
  PaginatedResponse,
} from '../types/incident.types';

const BASE = '/incidents';

export const incidentsApi = {
  list: (filters?: IncidentFilters) =>
    apiClient
      .get<PaginatedResponse<IncidentListItem>>(BASE + '/', { params: filters })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Incident>(`${BASE}/${id}/`).then((r) => r.data),

  create: (payload: CreateIncidentPayload) =>
    apiClient.post<Incident>(`${BASE}/`, payload).then((r) => r.data),

  update: (id: string, payload: UpdateIncidentPayload) =>
    apiClient.patch<Incident>(`${BASE}/${id}/`, payload).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}/`),

  submit: (id: string) =>
    apiClient.post<Incident>(`${BASE}/${id}/submit/`).then((r) => r.data),

  transitionStatus: (id: string, payload: TransitionStatusPayload) =>
    apiClient.post<Incident>(`${BASE}/${id}/transition/`, payload).then((r) => r.data),

  assign: (id: string, payload: AssignIncidentPayload) =>
    apiClient.post<Incident>(`${BASE}/${id}/assign/`, payload).then((r) => r.data),

  getHistory: (id: string) =>
    apiClient.get<IncidentStatusHistory[]>(`${BASE}/${id}/history/`).then((r) => r.data),

  getStats: () =>
    apiClient.get<IncidentStats>(`${BASE}/stats/`).then((r) => r.data),

  uploadAttachment: (id: string, file: File, caption?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (caption) form.append('caption', caption);
    return apiClient
      .post<IncidentAttachment>(`${BASE}/${id}/attachments/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  deleteAttachment: (incidentId: string, attachmentId: string) =>
    apiClient.delete(`${BASE}/${incidentId}/attachments/${attachmentId}/`),
};
