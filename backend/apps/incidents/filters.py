import django_filters
from django.db.models import Q

from .models import Incident
from .constants import IncidentType, IncidentSeverity, IncidentStatus


class IncidentFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(choices=IncidentStatus.choices)
    incident_type = django_filters.MultipleChoiceFilter(choices=IncidentType.choices)
    severity = django_filters.MultipleChoiceFilter(choices=IncidentSeverity.choices)
    date_from = django_filters.DateFilter(field_name='date_of_incident', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date_of_incident', lookup_expr='lte')
    site = django_filters.UUIDFilter(field_name='site__id')
    department = django_filters.UUIDFilter(field_name='department__id')
    reported_by = django_filters.UUIDFilter(field_name='reported_by__id')
    assigned_to = django_filters.UUIDFilter(field_name='assigned_to__id')
    injury_occurred = django_filters.BooleanFilter()
    environmental_impact = django_filters.BooleanFilter()
    property_damage = django_filters.BooleanFilter()
    unassigned = django_filters.BooleanFilter(method='filter_unassigned')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Incident
        fields = [
            'status', 'incident_type', 'severity',
            'date_from', 'date_to',
            'site', 'department',
            'reported_by', 'assigned_to',
            'injury_occurred', 'environmental_impact', 'property_damage',
            'unassigned', 'search',
        ]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value)
            | Q(reference_number__icontains=value)
            | Q(description__icontains=value)
            | Q(location_detail__icontains=value)
        )

    def filter_unassigned(self, queryset, name, value):
        if value:
            return queryset.filter(assigned_to__isnull=True)
        return queryset.filter(assigned_to__isnull=False)
