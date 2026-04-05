import django_filters
from .models import Investigation
from .constants import InvestigationStatus, RCAMethod


class InvestigationFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(choices=InvestigationStatus.choices)
    rca_method = django_filters.MultipleChoiceFilter(choices=RCAMethod.choices)
    lead_investigator = django_filters.UUIDFilter(field_name='lead_investigator__id')
    incident = django_filters.UUIDFilter(field_name='incident__id')
    date_from = django_filters.DateFilter(field_name='created_at__date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='created_at__date', lookup_expr='lte')
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Investigation
        fields = ['status', 'rca_method', 'lead_investigator', 'incident']

    def filter_overdue(self, queryset, name, value):
        from django.utils import timezone
        today = timezone.now().date()
        if value:
            return queryset.filter(
                target_completion_date__lt=today,
            ).exclude(status=InvestigationStatus.CLOSED)
        return queryset

    def filter_search(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value)
            | Q(reference_number__icontains=value)
            | Q(scope__icontains=value)
            | Q(incident__title__icontains=value)
            | Q(incident__reference_number__icontains=value)
        )
