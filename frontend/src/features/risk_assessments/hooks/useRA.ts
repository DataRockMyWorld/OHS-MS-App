import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { raApi } from '../api/raApi';
import type { CreateAssessmentPayload, CreateHazardPayload } from '../types/ra.types';

export function useAssessments(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['risk-assessments', params],
    queryFn: () => raApi.list(params),
    staleTime: 2 * 60_000,
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: ['risk-assessment', id],
    queryFn: () => raApi.get(id),
    enabled: !!id,
  });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssessmentPayload) => raApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-assessments'] }),
  });
}

export function useUpdateAssessment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateAssessmentPayload>) => raApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risk-assessment', id] });
      qc.invalidateQueries({ queryKey: ['risk-assessments'] });
    },
  });
}

export function useTransitionAssessment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => raApi.transitionStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risk-assessment', id] });
      qc.invalidateQueries({ queryKey: ['risk-assessments'] });
    },
  });
}

export function useAddHazard(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHazardPayload) => raApi.addHazard(assessmentId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-assessment', assessmentId] }),
  });
}

export function useUpdateHazard(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hazardId, payload }: { hazardId: string; payload: Partial<CreateHazardPayload> }) =>
      raApi.updateHazard(assessmentId, hazardId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-assessment', assessmentId] }),
  });
}

export function useDeleteHazard(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hazardId: string) => raApi.deleteHazard(assessmentId, hazardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-assessment', assessmentId] }),
  });
}
