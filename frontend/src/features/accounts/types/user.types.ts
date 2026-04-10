export type UserRole =
  | 'super_admin'
  | 'org_admin'
  | 'hse_manager'
  | 'supervisor'
  | 'employee'
  | 'auditor';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  org_admin: 'Org Admin',
  hse_manager: 'HSE Manager',
  supervisor: 'Supervisor',
  employee: 'Employee',
  auditor: 'Auditor',
};

export interface Department {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  job_title: string;
  phone: string;
  department: string | null;       // UUID
  department_name: string | null;
  is_active: boolean;
  date_joined: string;
}

export interface InviteMemberPayload {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  job_title?: string;
  phone?: string;
  department?: string | null;
}

export interface UpdateMemberPayload {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  job_title?: string;
  phone?: string;
  department?: string | null;
}

export interface InviteResponse extends TeamMember {
  temp_password: string;
}
