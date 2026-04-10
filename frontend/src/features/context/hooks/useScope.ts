import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getScope, updateScope } from '../api/contextApi';
import type { UpdateScopePayload } from '../types/context.types';

export function useScope() {
  return useQuery({
    queryKey: ['ohsms-scope'],
    queryFn: getScope,
    staleTime: 60_000,
  });
}

export function useUpdateScope() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateScopePayload) => updateScope(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ohsms-scope'] });
    },
  });
}
