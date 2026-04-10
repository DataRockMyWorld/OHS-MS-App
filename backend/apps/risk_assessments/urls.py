from django.urls import path
from .views import (
    HazardAssessmentListView,
    HazardAssessmentDetailView,
    AssessmentStatusView,
    HazardListCreateView,
    HazardDetailView,
)

urlpatterns = [
    path('risk-assessments/', HazardAssessmentListView.as_view(), name='risk-assessment-list'),
    path('risk-assessments/<uuid:pk>/', HazardAssessmentDetailView.as_view(), name='risk-assessment-detail'),
    path('risk-assessments/<uuid:pk>/status/', AssessmentStatusView.as_view(), name='risk-assessment-status'),
    path('risk-assessments/<uuid:assessment_pk>/hazards/', HazardListCreateView.as_view(), name='hazard-list'),
    path('risk-assessments/<uuid:assessment_pk>/hazards/<uuid:hazard_pk>/', HazardDetailView.as_view(), name='hazard-detail'),
]
