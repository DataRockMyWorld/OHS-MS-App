from django.urls import path
from .views import (
    LegalRequirementListCreateView,
    LegalRequirementDetailView,
    LegalComplianceReviewCreateView,
)

urlpatterns = [
    path('legal/', LegalRequirementListCreateView.as_view(), name='legal-list'),
    path('legal/<uuid:pk>/', LegalRequirementDetailView.as_view(), name='legal-detail'),
    path('legal/<uuid:pk>/reviews/', LegalComplianceReviewCreateView.as_view(), name='legal-review'),
]
