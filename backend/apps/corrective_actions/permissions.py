from rest_framework.permissions import BasePermission, SAFE_METHODS


class CAPermission(BasePermission):
    """
    Role-based permission for corrective action endpoints.

    Read: all authenticated org members + auditors
    Write/create: employee (own) + supervisor + hse_manager + org_admin
    Destroy: org_admin + super_admin only
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = request.user.role

        if role == 'super_admin':
            return True

        if role == 'auditor':
            return request.method in SAFE_METHODS

        return bool(request.user.organization_id)

    def has_object_permission(self, request, view, obj):
        user = request.user
        role = user.role

        if role == 'super_admin':
            return True

        if obj.organization_id != user.organization_id:
            return False

        if role == 'auditor':
            return request.method in SAFE_METHODS

        if role == 'org_admin':
            return True

        if role == 'hse_manager':
            return view.action != 'destroy'

        if role in ('supervisor', 'employee'):
            if request.method in SAFE_METHODS:
                return True
            # Can edit CAs assigned to them or created by them
            return (
                str(obj.assigned_to_id) == str(user.id) or
                str(obj.created_by_id) == str(user.id)
            )

        return False


class IsHSEManagerOrAbove(BasePermission):
    ALLOWED_ROLES = {'hse_manager', 'org_admin', 'super_admin'}

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in self.ALLOWED_ROLES
        )


class IsOrgAdminOrAbove(BasePermission):
    ALLOWED_ROLES = {'org_admin', 'super_admin'}

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in self.ALLOWED_ROLES
        )
