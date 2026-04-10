from django.urls import path
from .public_views import (
    AnonymousReportView,
    AnonymousReportAdminListView,
    AnonymousReportAdminDetailView,
)

urlpatterns = [
    # Public — no auth
    path('public/report/<slug:org_slug>/', AnonymousReportView.as_view(), name='anon-report'),
    # Admin review
    path('anonymous-reports/', AnonymousReportAdminListView.as_view(), name='anon-report-list'),
    path('anonymous-reports/<uuid:pk>/', AnonymousReportAdminDetailView.as_view(), name='anon-report-detail'),
]
