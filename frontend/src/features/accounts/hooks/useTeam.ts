import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '../api/teamApi';
import type { InviteMemberPayload, UpdateMemberPayload } from '../types/user.types';

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: teamApi.listMembers,
    staleTime: 2 * 60_000,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: teamApi.listDepartments,
    staleTime: 10 * 60_000,
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteMemberPayload) => teamApi.inviteMember(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      qc.invalidateQueries({ queryKey: ['org-users'] });
    },
  });
}

export function useUpdateMember(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMemberPayload) => teamApi.updateMember(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
      qc.invalidateQueries({ queryKey: ['org-users'] });
    },
  });
}

export function useToggleMemberActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.toggleActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}
