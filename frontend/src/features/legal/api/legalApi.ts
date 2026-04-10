import apiClient from '@/lib/axios';
import type {
  LegalRequirement,
  LegalRequirementListItem,
  CreateLegalRequirementPayload,
  AddReviewPayload,
} from '../types/legal.types';

export const legalApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<LegalRequirementListItem[]>('/legal/', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<LegalRequirement>(`/legal/${id}/`).then((r) => r.data),

  create: (payload: CreateLegalRequirementPayload) =>
    apiClient.post<LegalRequirement>('/legal/', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateLegalRequirementPayload>) =>
    apiClient.patch<LegalRequirement>(`/legal/${id}/`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/legal/${id}/`),

  addReview: (id: string, payload: AddReviewPayload) =>
    apiClient.post<LegalRequirement>(`/legal/${id}/reviews/`, payload).then((r) => r.data),
};
