from django.urls import path
from .views import MeView, OrgUsersView

urlpatterns = [
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('users/', OrgUsersView.as_view(), name='org-users'),
]
