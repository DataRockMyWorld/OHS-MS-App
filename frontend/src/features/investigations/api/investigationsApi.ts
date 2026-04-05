import apiClient from '@/lib/axios';
import type {
  Investigation,
  InvestigationListItem,
  CreateInvestigationPayload,
  UpdateInvestigationPayload,
  TransitionInvestigationPayload,
  AddTeamMemberPayload,
  CreateRootCausePayload,
  RootCause,
  InvestigationStatusHistory,
  InvestigationStats,
  InvestigationFilters,
  PaginatedResponse,
} from '../types/investigation.types';

const BASE = '/investigations';

export const investigationsApi = {
  list: (filters?: InvestigationFilters) =>
    apiClient
      .get<PaginatedResponse<InvestigationListItem>>(BASE + '/', { params: filters })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Investigation>(`${BASE}/${id}/`).then((r) => r.data),

  create: (payload: CreateInvestigationPayload) =>
    apiClient.post<Investigation>(`${BASE}/`, payload).then((r) => r.data),

  update: (id: string, payload: UpdateInvestigationPayload) =>
    apiClient.patch<Investigation>(`${BASE}/${id}/`, payload).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}/`),

  transitionStatus: (id: string, payload: TransitionInvestigationPayload) =>
    apiClient.post<Investigation>(`${BASE}/${id}/transition/`, payload).then((r) => r.data),

  getHistory: (id: string) =>
    apiClient
      .get<InvestigationStatusHistory[]>(`${BASE}/${id}/history/`)
      .then((r) => r.data),

  getStats: () =>
    apiClient.get<InvestigationStats>(`${BASE}/stats/`).then((r) => r.data),

  // Root causes
  getRootCauses: (id: string) =>
    apiClient.get<RootCause[]>(`${BASE}/${id}/root-causes/`).then((r) => r.data),

  addRootCause: (id: string, payload: CreateRootCausePayload) =>
    apiClient
      .post<RootCause>(`${BASE}/${id}/root-causes/`, payload)
      .then((r) => r.data),

  deleteRootCause: (investigationId: string, rootCauseId: string) =>
    apiClient.delete(`${BASE}/${investigationId}/root-causes/${rootCauseId}/`),

  // Team
  addTeamMember: (id: string, payload: AddTeamMemberPayload) =>
    apiClient.post<Investigation>(`${BASE}/${id}/team/`, payload).then((r) => r.data),

  removeTeamMember: (id: string, userId: string) =>
    apiClient.delete(`${BASE}/${id}/team/${userId}/`),
};
