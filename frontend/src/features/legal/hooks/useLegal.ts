import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalApi } from '../api/legalApi';
import type { CreateLegalRequirementPayload, AddReviewPayload } from '../types/legal.types';

export function useLegalRequirements(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['legal', params],
    queryFn: () => legalApi.list(params),
    staleTime: 30_000,
  });
}

export function useLegalRequirement(id: string) {
  return useQuery({
    queryKey: ['legal', id],
    queryFn: () => legalApi.get(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useCreateLegalRequirement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLegalRequirementPayload) => legalApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['legal'] }),
  });
}

export function useUpdateLegalRequirement(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateLegalRequirementPayload>) => legalApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['legal', id] });
      qc.invalidateQueries({ queryKey: ['legal'] });
    },
  });
}

export function useAddLegalReview(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddReviewPayload) => legalApi.addReview(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['legal', id] });
      qc.invalidateQueries({ queryKey: ['legal'] });
    },
  });
}
