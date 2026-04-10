import { useAuth } from '@/contexts/AuthContext';
import { hasMinRole } from '@/lib/permissions';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

interface RequireRoleProps {
  minRole: string;
  children: React.ReactNode;
}

/**
 * Renders children if the current user meets minRole; otherwise shows the 403 page.
 * Wrap route elements with this to gate entire pages.
 */
export default function RequireRole({ minRole, children }: RequireRoleProps) {
  const { user } = useAuth();

  if (!hasMinRole(user?.role, minRole)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
}
