import apiClient from '@/lib/axios';
import type { AuthUser } from '@/contexts/AuthContext';

export const profileApi = {
  updateMe: (payload: Partial<{ first_name: string; last_name: string; job_title: string; phone: string; department: string | null }>) =>
    apiClient.patch<AuthUser>('/auth/me/', payload).then((r) => r.data),

  changePassword: (current_password: string, new_password: string) =>
    apiClient.post('/auth/me/change-password/', { current_password, new_password }).then((r) => r.data),
};
