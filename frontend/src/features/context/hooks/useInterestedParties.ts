import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInterestedParties,
  getInterestedParty,
  createInterestedParty,
  updateInterestedParty,
} from '../api/contextApi';
import type { CreateInterestedPartyPayload } from '../types/context.types';

export function useInterestedParties() {
  return useQuery({
    queryKey: ['interested-parties'],
    queryFn: getInterestedParties,
    staleTime: 30_000,
  });
}

export function useInterestedParty(id: string) {
  return useQuery({
    queryKey: ['interested-party', id],
    queryFn: () => getInterestedParty(id),
    enabled: !!id,
  });
}

export function useCreateInterestedParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInterestedPartyPayload) => createInterestedParty(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interested-parties'] });
    },
  });
}

export function useUpdateInterestedParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateInterestedPartyPayload> }) =>
      updateInterestedParty(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['interested-parties'] });
      qc.invalidateQueries({ queryKey: ['interested-party', id] });
    },
  });
}
