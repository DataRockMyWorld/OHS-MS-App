import apiClient from '@/lib/axios';
import type {
  HazardAssessmentListItem,
  HazardAssessment,
  CreateAssessmentPayload,
  Hazard,
  CreateHazardPayload,
} from '../types/ra.types';

export const raApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<HazardAssessmentListItem[]>('/risk-assessments/', { params }).then((r) => r.data),

  create: (payload: CreateAssessmentPayload) =>
    apiClient.post<HazardAssessment>('/risk-assessments/', payload).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<HazardAssessment>(`/risk-assessments/${id}/`).then((r) => r.data),

  update: (id: string, payload: Partial<CreateAssessmentPayload>) =>
    apiClient.patch<HazardAssessment>(`/risk-assessments/${id}/`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/risk-assessments/${id}/`),

  transitionStatus: (id: string, status: string) =>
    apiClient.post<HazardAssessment>(`/risk-assessments/${id}/status/`, { status }).then((r) => r.data),

  listHazards: (assessmentId: string) =>
    apiClient.get<Hazard[]>(`/risk-assessments/${assessmentId}/hazards/`).then((r) => r.data),

  addHazard: (assessmentId: string, payload: CreateHazardPayload) =>
    apiClient.post<Hazard>(`/risk-assessments/${assessmentId}/hazards/`, payload).then((r) => r.data),

  updateHazard: (assessmentId: string, hazardId: string, payload: Partial<CreateHazardPayload>) =>
    apiClient.patch<Hazard>(`/risk-assessments/${assessmentId}/hazards/${hazardId}/`, payload).then((r) => r.data),

  deleteHazard: (assessmentId: string, hazardId: string) =>
    apiClient.delete(`/risk-assessments/${assessmentId}/hazards/${hazardId}/`),
};
