from django.urls import path
from .views import (
    MeView,
    ChangePasswordView,
    OrgUsersView,
    TeamMembersView,
    UserInviteView,
    UserDetailView,
    UserDeactivateView,
    DepartmentListView,
    NotificationListView,
    NotificationUnreadCountView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
)

urlpatterns = [
    # Auth / current user
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/me/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    # Org user picker (lightweight, all active users)
    path('users/', OrgUsersView.as_view(), name='org-users'),

    # Team management
    path('team/', TeamMembersView.as_view(), name='team-list'),
    path('team/invite/', UserInviteView.as_view(), name='team-invite'),
    path('team/<uuid:pk>/', UserDetailView.as_view(), name='team-detail'),
    path('team/<uuid:pk>/deactivate/', UserDeactivateView.as_view(), name='team-deactivate'),

    # Departments
    path('departments/', DepartmentListView.as_view(), name='departments-list'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/unread-count/', NotificationUnreadCountView.as_view(), name='notifications-unread-count'),
    path('notifications/read-all/', NotificationMarkAllReadView.as_view(), name='notifications-read-all'),
    path('notifications/<uuid:pk>/read/', NotificationMarkReadView.as_view(), name='notifications-mark-read'),
]
