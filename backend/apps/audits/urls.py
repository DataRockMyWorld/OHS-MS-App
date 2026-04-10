from django.urls import path
from .views import (
    AuditListCreateView,
    AuditDetailView,
    AuditCompleteView,
    AuditFindingListCreateView,
    AuditFindingDetailView,
    RaiseCAfromFindingView,
)

urlpatterns = [
    path('audits/', AuditListCreateView.as_view(), name='audit-list'),
    path('audits/<uuid:pk>/', AuditDetailView.as_view(), name='audit-detail'),
    path('audits/<uuid:pk>/complete/', AuditCompleteView.as_view(), name='audit-complete'),
    path('audits/<uuid:audit_pk>/findings/', AuditFindingListCreateView.as_view(), name='audit-findings'),
    path('audits/<uuid:audit_pk>/findings/<uuid:finding_pk>/', AuditFindingDetailView.as_view(), name='audit-finding-detail'),
    path('audits/<uuid:audit_pk>/findings/<uuid:finding_pk>/raise-ca/', RaiseCAfromFindingView.as_view(), name='audit-finding-raise-ca'),
]
