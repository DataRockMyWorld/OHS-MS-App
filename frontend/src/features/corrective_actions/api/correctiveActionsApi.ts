import apiClient from '@/lib/axios';
import type {
  CorrectiveAction,
  CAListItem,
  CreateCAPayload,
  UpdateCAPayload,
  TransitionCAPayload,
  CreateEffectivenessReviewPayload,
  EffectivenessReview,
  CAStatusHistory,
  CAStats,
  CAFilters,
  PaginatedResponse,
} from '../types/ca.types';

const BASE = '/corrective-actions';

export const correctiveActionsApi = {
  list: (filters?: CAFilters) =>
    apiClient
      .get<PaginatedResponse<CAListItem>>(BASE + '/', { params: filters })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<CorrectiveAction>(`${BASE}/${id}/`).then((r) => r.data),

  create: (payload: CreateCAPayload) =>
    apiClient.post<CorrectiveAction>(`${BASE}/`, payload).then((r) => r.data),

  update: (id: string, payload: UpdateCAPayload) =>
    apiClient.patch<CorrectiveAction>(`${BASE}/${id}/`, payload).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`${BASE}/${id}/`),

  transitionStatus: (id: string, payload: TransitionCAPayload) =>
    apiClient
      .post<CorrectiveAction>(`${BASE}/${id}/transition/`, payload)
      .then((r) => r.data),

  getHistory: (id: string) =>
    apiClient
      .get<CAStatusHistory[]>(`${BASE}/${id}/history/`)
      .then((r) => r.data),

  getStats: () =>
    apiClient.get<CAStats>(`${BASE}/stats/`).then((r) => r.data),

  getEffectivenessReviews: (id: string) =>
    apiClient
      .get<EffectivenessReview[]>(`${BASE}/${id}/effectiveness-reviews/`)
      .then((r) => r.data),

  addEffectivenessReview: (id: string, payload: CreateEffectivenessReviewPayload) =>
    apiClient
      .post<CorrectiveAction>(`${BASE}/${id}/effectiveness-reviews/`, payload)
      .then((r) => r.data),
};
