from django.urls import path
from . import views

urlpatterns = [
    # Management System Scope (4.3)
    path('context/scope/', views.ManagementSystemScopeView.as_view(), name='context-scope'),

    # Interested Parties (4.2)
    path('context/interested-parties/', views.InterestedPartyListView.as_view(), name='interested-party-list'),
    path('context/interested-parties/<uuid:pk>/', views.InterestedPartyDetailView.as_view(), name='interested-party-detail'),

    # Context Issues (4.1)
    path('context/issues/', views.ContextIssueListView.as_view(), name='context-issue-list'),
    path('context/issues/stats/', views.ContextIssueStatsView.as_view(), name='context-issue-stats'),
    path('context/issues/<uuid:pk>/', views.ContextIssueDetailView.as_view(), name='context-issue-detail'),

    # Risks & Opportunities
    path('context/risks-and-opportunities/', views.RiskOpportunityListView.as_view(), name='ro-list'),
    path('context/risks-and-opportunities/stats/', views.RiskOpportunityStatsView.as_view(), name='ro-stats'),
    path('context/risks-and-opportunities/<uuid:pk>/', views.RiskOpportunityDetailView.as_view(), name='ro-detail'),
]
