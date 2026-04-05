import django_filters
from .models import CorrectiveAction
from .constants import CAStatus, CAPriority, CAType, CASource


class CAFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(choices=CAStatus.choices)
    priority = django_filters.MultipleChoiceFilter(choices=CAPriority.choices)
    action_type = django_filters.MultipleChoiceFilter(choices=CAType.choices)
    source_type = django_filters.MultipleChoiceFilter(choices=CASource.choices)
    assigned_to = django_filters.UUIDFilter(field_name='assigned_to__id')
    source_investigation = django_filters.UUIDFilter(field_name='source_investigation__id')
    source_incident = django_filters.UUIDFilter(field_name='source_incident__id')
    date_from = django_filters.DateFilter(field_name='created_at__date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='created_at__date', lookup_expr='lte')
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = CorrectiveAction
        fields = ['status', 'priority', 'action_type', 'source_type', 'assigned_to']

    def filter_overdue(self, queryset, name, value):
        from django.utils import timezone
        today = timezone.now().date()
        if value:
            return queryset.filter(
                target_date__lt=today,
            ).exclude(status=CAStatus.CLOSED)
        return queryset

    def filter_search(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value)
            | Q(reference_number__icontains=value)
            | Q(description__icontains=value)
            | Q(source_investigation__title__icontains=value)
            | Q(source_investigation__reference_number__icontains=value)
            | Q(source_incident__title__icontains=value)
            | Q(source_incident__reference_number__icontains=value)
        )
