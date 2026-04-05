import { useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '../api/incidentsApi';
import { incidentKeys } from './useIncidents';
import type {
  CreateIncidentPayload,
  UpdateIncidentPayload,
  TransitionStatusPayload,
  AssignIncidentPayload,
} from '../types/incident.types';

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncidentPayload) => incidentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.stats() });
    },
  });
}

export function useUpdateIncident(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateIncidentPayload) => incidentsApi.update(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(incidentKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

export function useSubmitIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incidentsApi.submit(id),
    onSuccess: (data) => {
      qc.setQueryData(incidentKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.stats() });
    },
  });
}

export function useTransitionStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransitionStatusPayload) =>
      incidentsApi.transitionStatus(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(incidentKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.stats() });
      qc.invalidateQueries({ queryKey: incidentKeys.history(id) });
    },
  });
}

export function useAssignIncident(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignIncidentPayload) => incidentsApi.assign(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(incidentKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

export function useUploadAttachment(incidentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) =>
      incidentsApi.uploadAttachment(incidentId, file, caption),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}

export function useDeleteAttachment(incidentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) =>
      incidentsApi.deleteAttachment(incidentId, attachmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
    },
  });
}

export function useDeleteIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incidentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incidentKeys.lists() });
      qc.invalidateQueries({ queryKey: incidentKeys.stats() });
    },
  });
}
