from rest_framework.permissions import BasePermission, SAFE_METHODS


class InvestigationPermission(BasePermission):
    """
    Role-based permission for all investigation endpoints.

    Read:
      - super_admin, org_admin, hse_manager, supervisor: all org investigations
      - employee: only investigations linked to their own incidents
      - auditor: read-only

    Write / create:
      - super_admin, org_admin, hse_manager: all
      - supervisor: create + edit own led investigations
      - employee, auditor: never write

    Destroy (soft-delete):
      - org_admin, super_admin only
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = request.user.role

        if role == 'super_admin':
            return True

        if role == 'auditor':
            return request.method in SAFE_METHODS

        if role == 'employee':
            return request.method in SAFE_METHODS

        return bool(request.user.organization_id)

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = user.role

        if role == 'super_admin':
            return True

        if obj.organization_id != user.organization_id:
            return False

        if role in ('auditor', 'employee'):
            return request.method in SAFE_METHODS

        if role == 'org_admin':
            return True

        if role == 'hse_manager':
            return view.action != 'destroy'

        if role == 'supervisor':
            if request.method in SAFE_METHODS:
                return True
            # Supervisors can edit investigations they lead OR are a team member of
            if str(obj.lead_investigator_id) == str(user.id):
                return True
            return obj.team_members.filter(id=user.id).exists()

        return False


class IsHSEManagerOrAbove(BasePermission):
    ALLOWED_ROLES = {'hse_manager', 'org_admin', 'super_admin'}

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in self.ALLOWED_ROLES
        )

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'super_admin':
            return True
        return obj.organization_id == user.organization_id


class IsOrgAdminOrAbove(BasePermission):
    ALLOWED_ROLES = {'org_admin', 'super_admin'}

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in self.ALLOWED_ROLES
        )
