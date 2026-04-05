import apiClient from '@/lib/axios';
import type { DashboardData } from '../types/dashboard.types';

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>('/dashboard/');
  return data;
}
