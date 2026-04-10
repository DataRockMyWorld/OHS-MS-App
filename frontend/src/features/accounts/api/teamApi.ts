import apiClient from '@/lib/axios';
import type {
  TeamMember,
  Department,
  InviteMemberPayload,
  UpdateMemberPayload,
  InviteResponse,
} from '../types/user.types';

export const teamApi = {
  listMembers: () =>
    apiClient.get<TeamMember[]>('/team/').then((r) => r.data),

  inviteMember: (payload: InviteMemberPayload) =>
    apiClient.post<InviteResponse>('/team/invite/', payload).then((r) => r.data),

  getMember: (id: string) =>
    apiClient.get<TeamMember>(`/team/${id}/`).then((r) => r.data),

  updateMember: (id: string, payload: UpdateMemberPayload) =>
    apiClient.patch<TeamMember>(`/team/${id}/`, payload).then((r) => r.data),

  toggleActive: (id: string) =>
    apiClient.post<TeamMember>(`/team/${id}/deactivate/`).then((r) => r.data),

  listDepartments: () =>
    apiClient.get<Department[]>('/departments/').then((r) => r.data),
};
