import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getObjective,
  updateObjective,
  closeObjective,
  computeMetric,
  createMeasurement,
} from '../api/objectivesApi';
import type { CreateObjectivePayload, CreateMeasurementPayload } from '../types/objective.types';

export function useObjective(id: string) {
  return useQuery({
    queryKey: ['objective', id],
    queryFn: () => getObjective(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useUpdateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateObjectivePayload> }) =>
      updateObjective(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['objective', data.id] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}

export function useCloseObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => closeObjective(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}

export function useComputeMetric() {
  return useMutation({
    mutationFn: (id: string) => computeMetric(id),
  });
}

export function useCreateMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      objectiveId,
      payload,
    }: {
      objectiveId: string;
      payload: CreateMeasurementPayload;
    }) => createMeasurement(objectiveId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['objective', variables.objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
  });
}
