import secrets
import string

from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

from apps.core.models import Department
from .models import User, Notification
from .serializers import (
    UserMeSerializer,
    UserMinimalSerializer,
    UserDetailSerializer,
    UserInviteSerializer,
    UserUpdateSerializer,
    DepartmentSerializer,
    NotificationSerializer,
)


# ── Current-user views ────────────────────────────────────────────────────────

class MeView(APIView):
    """Return or update the currently authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserMeSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        allowed_fields = {'first_name', 'last_name', 'job_title', 'phone', 'department'}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        serializer = UserUpdateSerializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserMeSerializer(user, context={'request': request}).data)


class ChangePasswordView(APIView):
    """Allow the authenticated user to change their own password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not request.user.check_password(current_password):
            return Response(
                {'current_password': ['Incorrect password.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(new_password) < 8:
            return Response(
                {'new_password': ['Password must be at least 8 characters.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.set_password(new_password)
        request.user.save(update_fields=['password'])
        return Response({'detail': 'Password changed successfully.'})


# ── Org user management ───────────────────────────────────────────────────────

class OrgUsersView(ListAPIView):
    """List all active users in the requesting user's organization."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserMinimalSerializer
    pagination_class = None  # Return plain array — picker needs all users at once

    def get_queryset(self):
        user = self.request.user
        if not user.organization_id:
            return User.objects.none()
        return User.objects.filter(
            organization_id=user.organization_id,
            is_active=True,
        ).order_by('first_name', 'last_name')


class TeamMembersView(ListAPIView):
    """Full user list for the team management page (active + inactive)."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserDetailSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if not user.organization_id:
            return User.objects.none()
        qs = User.objects.filter(organization_id=user.organization_id)
        if not user.is_org_admin_or_above():
            qs = qs.filter(is_active=True)
        return qs.select_related('department').order_by('first_name', 'last_name')


class UserInviteView(APIView):
    """Invite (create) a new user in the same organization. ORG_ADMIN+ only."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_org_admin_or_above():
            raise PermissionDenied('Only organization admins can invite members.')

        serializer = UserInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        org_id = request.user.organization_id

        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'email': ['A user with this email already exists.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        dept = None
        if data.get('department'):
            try:
                dept = Department.objects.get(id=data['department'], organization_id=org_id)
            except Department.DoesNotExist:
                pass

        # Generate a temporary password
        alphabet = string.ascii_letters + string.digits + '!@#$'
        temp_password = ''.join(secrets.choice(alphabet) for _ in range(12))

        new_user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            password=temp_password,
            role=data['role'],
            job_title=data.get('job_title', ''),
            phone=data.get('phone', ''),
            organization_id=org_id,
            department=dept,
        )

        return Response(
            {**UserDetailSerializer(new_user).data, 'temp_password': temp_password},
            status=status.HTTP_201_CREATED,
        )


class UserDetailView(APIView):
    """Retrieve or update a single team member. ORG_ADMIN+ required for updates."""
    permission_classes = [IsAuthenticated]

    def _get_user(self, request, pk):
        return get_object_or_404(
            User,
            pk=pk,
            organization_id=request.user.organization_id,
        )

    def get(self, request, pk):
        member = self._get_user(request, pk)
        return Response(UserDetailSerializer(member).data)

    def patch(self, request, pk):
        if not request.user.is_org_admin_or_above():
            raise PermissionDenied('Only organization admins can edit members.')
        member = self._get_user(request, pk)
        serializer = UserUpdateSerializer(member, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserDetailSerializer(member).data)


class UserDeactivateView(APIView):
    """Toggle a team member's active status. ORG_ADMIN+ only."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_org_admin_or_above():
            raise PermissionDenied('Only organization admins can deactivate members.')
        if str(request.user.pk) == str(pk):
            return Response(
                {'detail': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        member = get_object_or_404(
            User, pk=pk, organization_id=request.user.organization_id
        )
        member.is_active = not member.is_active
        member.save(update_fields=['is_active'])
        return Response(UserDetailSerializer(member).data)


# ── Departments ───────────────────────────────────────────────────────────────

class DepartmentListView(ListAPIView):
    """List departments for the authenticated user's organization."""
    permission_classes = [IsAuthenticated]
    serializer_class = DepartmentSerializer
    pagination_class = None

    def get_queryset(self):
        if not self.request.user.organization_id:
            return Department.objects.none()
        return Department.objects.filter(
            organization_id=self.request.user.organization_id,
            is_active=True,
        ).order_by('name')


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationListView(ListAPIView):
    """Return the 30 most recent notifications for the current user."""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)[:30]


class NotificationUnreadCountView(APIView):
    """Return the count of unread notifications."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'count': count})


class NotificationMarkReadView(APIView):
    """Mark a single notification as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notif).data)


class NotificationMarkAllReadView(APIView):
    """Mark all notifications for the current user as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})
