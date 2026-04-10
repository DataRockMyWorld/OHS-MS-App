from django.urls import path
from .views import DashboardView
from .reports_views import SafetyMetricsView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('reports/metrics/', SafetyMetricsView.as_view(), name='reports-metrics'),
]
