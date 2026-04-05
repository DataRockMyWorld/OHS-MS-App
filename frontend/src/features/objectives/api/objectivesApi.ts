import apiClient from '@/lib/axios';
import type {
  ObjectiveListItem,
  ObjectiveDetail,
  ObjectiveStats,
  LeagueTableEntry,
  ComputeMetricResult,
  CreateObjectivePayload,
  CreateMeasurementPayload,
  KPIMeasurement,
} from '../types/objective.types';

export async function getObjectives(
  params?: { scope?: string; status?: string; owner?: string },
): Promise<ObjectiveListItem[]> {
  const { data } = await apiClient.get<ObjectiveListItem[]>('/objectives/', { params });
  return data;
}

export async function getObjective(id: string): Promise<ObjectiveDetail> {
  const { data } = await apiClient.get<ObjectiveDetail>(`/objectives/${id}/`);
  return data;
}

export async function createObjective(payload: CreateObjectivePayload): Promise<ObjectiveDetail> {
  const { data } = await apiClient.post<ObjectiveDetail>('/objectives/', payload);
  return data;
}

export async function updateObjective(
  id: string,
  payload: Partial<CreateObjectivePayload>,
): Promise<ObjectiveDetail> {
  const { data } = await apiClient.patch<ObjectiveDetail>(`/objectives/${id}/`, payload);
  return data;
}

export async function closeObjective(id: string): Promise<void> {
  await apiClient.delete(`/objectives/${id}/`);
}

export async function getObjectiveStats(): Promise<ObjectiveStats> {
  const { data } = await apiClient.get<ObjectiveStats>('/objectives/stats/');
  return data;
}

export async function computeMetric(id: string): Promise<ComputeMetricResult> {
  const { data } = await apiClient.post<ComputeMetricResult>(`/objectives/${id}/compute/`);
  return data;
}

export async function getMeasurements(objectiveId: string): Promise<KPIMeasurement[]> {
  const { data } = await apiClient.get<KPIMeasurement[]>(`/objectives/${objectiveId}/measurements/`);
  return data;
}

export async function createMeasurement(
  objectiveId: string,
  payload: CreateMeasurementPayload,
): Promise<KPIMeasurement> {
  const { data } = await apiClient.post<KPIMeasurement>(
    `/objectives/${objectiveId}/measurements/`,
    payload,
  );
  return data;
}

export async function getLeagueTable(): Promise<LeagueTableEntry[]> {
  const { data } = await apiClient.get<LeagueTableEntry[]>('/objectives/league-table/');
  return data;
}
