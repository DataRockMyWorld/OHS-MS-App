import { useMutation, useQueryClient } from '@tanstack/react-query';
import { investigationsApi } from '../api/investigationsApi';
import { investigationKeys } from './useInvestigations';
import type {
  CreateInvestigationPayload,
  UpdateInvestigationPayload,
  TransitionInvestigationPayload,
  AddTeamMemberPayload,
  CreateRootCausePayload,
} from '../types/investigation.types';

export function useCreateInvestigation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvestigationPayload) =>
      investigationsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationKeys.lists() });
      qc.invalidateQueries({ queryKey: investigationKeys.stats() });
    },
  });
}

export function useUpdateInvestigation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateInvestigationPayload) =>
      investigationsApi.update(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(investigationKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: investigationKeys.lists() });
    },
  });
}

export function useTransitionInvestigation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransitionInvestigationPayload) =>
      investigationsApi.transitionStatus(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(investigationKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: investigationKeys.lists() });
      qc.invalidateQueries({ queryKey: investigationKeys.stats() });
      qc.invalidateQueries({ queryKey: investigationKeys.history(id) });
    },
  });
}

export function useDeleteInvestigation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => investigationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationKeys.lists() });
      qc.invalidateQueries({ queryKey: investigationKeys.stats() });
    },
  });
}

export function useAddRootCause(investigationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRootCausePayload) =>
      investigationsApi.addRootCause(investigationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationKeys.detail(investigationId) });
    },
  });
}

export function useDeleteRootCause(investigationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rootCauseId: string) =>
      investigationsApi.deleteRootCause(investigationId, rootCauseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationKeys.detail(investigationId) });
    },
  });
}

export function useAddTeamMember(investigationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddTeamMemberPayload) =>
      investigationsApi.addTeamMember(investigationId, payload),
    onSuccess: (data) => {
      qc.setQueryData(investigationKeys.detail(investigationId), data);
    },
  });
}

export function useRemoveTeamMember(investigationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      investigationsApi.removeTeamMember(investigationId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationKeys.detail(investigationId) });
    },
  });
}
