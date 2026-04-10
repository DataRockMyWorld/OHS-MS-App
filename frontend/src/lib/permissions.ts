// Role rank — higher number = more authority
export const ROLE_RANK: Record<string, number> = {
  employee:    1,
  auditor:     2,
  supervisor:  3,
  hse_manager: 4,
  org_admin:   5,
  super_admin: 6,
};

export function hasMinRole(role: string | undefined | null, minRole: string): boolean {
  if (!role) return false;
  return (ROLE_RANK[role] ?? 0) >= (ROLE_RANK[minRole] ?? 0);
}

// Named capability checks — use these in components
export const can = {
  /** supervisor+ can manage incidents (edit, transition, assign, open investigations) */
  manageIncidents:     (role: string) => hasMinRole(role, 'supervisor'),
  /** supervisor+ can create/manage investigations */
  manageInvestigations:(role: string) => hasMinRole(role, 'supervisor'),
  /** supervisor+ can create/manage corrective actions */
  manageCAs:           (role: string) => hasMinRole(role, 'supervisor'),
  /** supervisor+ can view the context register */
  viewContext:         (role: string) => hasMinRole(role, 'supervisor'),
  /** hse_manager+ can create/edit context issues, R&Os, parties and the scope */
  manageContext:       (role: string) => hasMinRole(role, 'hse_manager'),
  /** supervisor+ can log KPI measurements */
  logMeasurements:     (role: string) => hasMinRole(role, 'supervisor'),
  /** hse_manager+ can create/edit objectives */
  manageObjectives:    (role: string) => hasMinRole(role, 'hse_manager'),
};
