import { useMutation, useQueryClient } from '@tanstack/react-query';
import { correctiveActionsApi } from '../api/correctiveActionsApi';
import { caKeys } from './useCorrectiveActions';
import type {
  CreateCAPayload,
  UpdateCAPayload,
  TransitionCAPayload,
  CreateEffectivenessReviewPayload,
} from '../types/ca.types';

export function useCreateCA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCAPayload) => correctiveActionsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: caKeys.lists() });
      qc.invalidateQueries({ queryKey: caKeys.stats() });
    },
  });
}

export function useUpdateCA(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCAPayload) => correctiveActionsApi.update(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(caKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: caKeys.lists() });
    },
  });
}

export function useTransitionCA(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransitionCAPayload) =>
      correctiveActionsApi.transitionStatus(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(caKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: caKeys.lists() });
      qc.invalidateQueries({ queryKey: caKeys.stats() });
      qc.invalidateQueries({ queryKey: caKeys.history(id) });
    },
  });
}

export function useDeleteCA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => correctiveActionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: caKeys.lists() });
      qc.invalidateQueries({ queryKey: caKeys.stats() });
    },
  });
}

export function useAddEffectivenessReview(caId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEffectivenessReviewPayload) =>
      correctiveActionsApi.addEffectivenessReview(caId, payload),
    onSuccess: (data) => {
      // Response is the full updated CA (status may have changed)
      qc.setQueryData(caKeys.detail(caId), data);
      qc.invalidateQueries({ queryKey: caKeys.lists() });
      qc.invalidateQueries({ queryKey: caKeys.stats() });
      qc.invalidateQueries({ queryKey: caKeys.history(caId) });
    },
  });
}
