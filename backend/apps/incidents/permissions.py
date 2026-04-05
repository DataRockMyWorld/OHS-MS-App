from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOrganizationMember(BasePermission):
    """
    Base tenant check: user must belong to the same organization as the object.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False
        org_id = getattr(obj, 'organization_id', None)
        return org_id is not None and org_id == user.organization_id


class IncidentPermission(BasePermission):
    """
    Role-based permission for all incident endpoints.

    List / create / read:
      - super_admin: always
      - org_admin, hse_manager, supervisor: all org incidents
      - employee: only their own incidents (enforced via get_queryset)
      - auditor: read-only, all org incidents

    Write / destroy:
      - super_admin: always
      - org_admin: all
      - hse_manager: all except hard delete
      - supervisor: only own incidents while DRAFT or REPORTED
      - employee: only own incidents while DRAFT
      - auditor: never
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = request.user.role

        if role == 'super_admin':
            return True

        if role == 'auditor':
            return request.method in SAFE_METHODS

        # All non-auditor authenticated org members may attempt access;
        # object-level checks refine further.
        return bool(request.user.organization_id)

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = user.role

        if role == 'super_admin':
            return True

        # Must be same org
        if obj.organization_id != user.organization_id:
            return False

        if role == 'auditor':
            return request.method in SAFE_METHODS

        if role == 'org_admin':
            return True

        if role == 'hse_manager':
            # HSE Managers can do everything except hard-delete (soft-delete is fine)
            return view.action != 'destroy'

        if role == 'supervisor':
            if request.method in SAFE_METHODS:
                return True
            # Can edit own incidents in draft/reported
            return (
                obj.reported_by_id == user.id
                and obj.status in ('draft', 'reported')
            )

        if role == 'employee':
            if request.method in SAFE_METHODS:
                return obj.reported_by_id == user.id
            # Employees can only edit their own drafts
            return obj.reported_by_id == user.id and obj.status == 'draft'

        return False


class IsHSEManagerOrAbove(BasePermission):
    """For transition, assign, and stats endpoints that require HSE Manager+."""

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
    """For soft-delete and other destructive actions."""

    ALLOWED_ROLES = {'org_admin', 'super_admin'}

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in self.ALLOWED_ROLES
        )
