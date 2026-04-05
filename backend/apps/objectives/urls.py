from django.urls import path

from .views import (
    ObjectiveListView,
    ObjectiveDetailView,
    ComputeMetricView,
    MeasurementListCreateView,
    ObjectiveStatsView,
    LeagueTableView,
)

urlpatterns = [
    path('objectives/', ObjectiveListView.as_view(), name='objective-list'),
    path('objectives/stats/', ObjectiveStatsView.as_view(), name='objective-stats'),
    path('objectives/league-table/', LeagueTableView.as_view(), name='objective-league-table'),
    path('objectives/<uuid:pk>/', ObjectiveDetailView.as_view(), name='objective-detail'),
    path('objectives/<uuid:pk>/compute/', ComputeMetricView.as_view(), name='objective-compute'),
    path('objectives/<uuid:pk>/measurements/', MeasurementListCreateView.as_view(), name='objective-measurements'),
]
