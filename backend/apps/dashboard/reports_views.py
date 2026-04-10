"""
Safety metrics / reports API — date-range analytics for the Reports page.
"""
from datetime import date
from dateutil.relativedelta import relativedelta

from django.utils import timezone
from django.db.models import Count, Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.incidents.models import Incident
from apps.incidents.constants import IncidentType, IncidentSeverity
from apps.corrective_actions.models import CorrectiveAction
from apps.corrective_actions.constants import CAStatus
from apps.investigations.models import Investigation
from apps.investigations.constants import InvestigationStatus


def _parse_date(value: str | None, fallback: date) -> date:
    if not value:
        return fallback
    try:
        return date.fromisoformat(value)
    except ValueError:
        return fallback


RECORDABLE_TYPES = [
    IncidentType.INJURY,
    IncidentType.FIRST_AID,
    IncidentType.MEDICAL_TREATMENT,
    IncidentType.LOST_TIME_INJURY,
    IncidentType.FATALITY,
]


class SafetyMetricsView(APIView):
    """
    GET /reports/metrics/?from=YYYY-MM-DD&to=YYYY-MM-DD&hours_worked=N

    Returns aggregate safety KPIs for the selected period.
    hours_worked is optional — used to compute LTIFR/TRIFR.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org_id = request.user.organization_id
        if not org_id:
            return Response(self._empty())

        today = timezone.now().date()
        date_from = _parse_date(request.query_params.get('from'), today.replace(day=1))
        date_to = _parse_date(request.query_params.get('to'), today)

        try:
            hours_worked = float(request.query_params.get('hours_worked', 0))
        except (TypeError, ValueError):
            hours_worked = 0.0

        incidents_qs = Incident.objects.filter(
            organization_id=org_id,
            is_deleted=False,
            date_of_incident__gte=date_from,
            date_of_incident__lte=date_to,
        )

        agg = incidents_qs.aggregate(
            total=Count('id'),
            lti_count=Count('id', filter=Q(incident_type=IncidentType.LOST_TIME_INJURY)),
            fatality_count=Count('id', filter=Q(incident_type=IncidentType.FATALITY)),
            near_miss_count=Count('id', filter=Q(incident_type=IncidentType.NEAR_MISS)),
            recordable_count=Count('id', filter=Q(incident_type__in=RECORDABLE_TYPES)),
            critical_count=Count('id', filter=Q(severity=IncidentSeverity.CRITICAL)),
            high_count=Count('id', filter=Q(severity=IncidentSeverity.HIGH)),
        )

        # Rate calculations (per 1,000,000 person-hours)
        MULTIPLIER = 1_000_000
        ltifr = round((agg['lti_count'] * MULTIPLIER) / hours_worked, 2) if hours_worked else None
        trifr = round((agg['recordable_count'] * MULTIPLIER) / hours_worked, 2) if hours_worked else None

        # By type breakdown
        by_type = list(
            incidents_qs
            .values('incident_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # By severity breakdown
        by_severity = list(
            incidents_qs
            .values('severity')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Monthly trend within the period
        monthly_trend = self._monthly_trend(org_id, date_from, date_to)

        # CA metrics for the period
        ca_qs = CorrectiveAction.objects.filter(
            organization_id=org_id,
            is_deleted=False,
            created_at__date__gte=date_from,
            created_at__date__lte=date_to,
        )
        ca_agg = ca_qs.aggregate(
            total=Count('id'),
            closed=Count('id', filter=Q(status=CAStatus.CLOSED)),
            overdue=Count('id', filter=Q(
                target_date__lt=today,
                status__in=[CAStatus.OPEN, CAStatus.IN_PROGRESS, CAStatus.REOPENED],
            )),
        )
        ca_closure_rate = (
            round(ca_agg['closed'] / ca_agg['total'] * 100, 1)
            if ca_agg['total'] else 0
        )

        # Investigation metrics for the period
        inv_qs = Investigation.objects.filter(
            organization_id=org_id,
            is_deleted=False,
            created_at__date__gte=date_from,
            created_at__date__lte=date_to,
        )
        inv_agg = inv_qs.aggregate(
            total=Count('id'),
            closed=Count('id', filter=Q(status=InvestigationStatus.CLOSED)),
        )
        inv_closure_rate = (
            round(inv_agg['closed'] / inv_agg['total'] * 100, 1)
            if inv_agg['total'] else 0
        )

        return Response({
            'period': {'from': date_from.isoformat(), 'to': date_to.isoformat()},
            'hours_worked': hours_worked or None,
            'kpis': {
                'total_incidents': agg['total'],
                'lti_count': agg['lti_count'],
                'fatality_count': agg['fatality_count'],
                'near_miss_count': agg['near_miss_count'],
                'recordable_count': agg['recordable_count'],
                'critical_count': agg['critical_count'],
                'high_count': agg['high_count'],
                'ltifr': ltifr,
                'trifr': trifr,
            },
            'by_type': by_type,
            'by_severity': by_severity,
            'monthly_trend': monthly_trend,
            'ca_metrics': {
                'total': ca_agg['total'],
                'closed': ca_agg['closed'],
                'overdue': ca_agg['overdue'],
                'closure_rate': ca_closure_rate,
            },
            'investigation_metrics': {
                'total': inv_agg['total'],
                'closed': inv_agg['closed'],
                'closure_rate': inv_closure_rate,
            },
        })

    def _monthly_trend(self, org_id: str, date_from: date, date_to: date) -> list:
        """Build month-by-month incident counts between date_from and date_to."""
        results = []
        cursor = date_from.replace(day=1)
        while cursor <= date_to:
            month_end = cursor + relativedelta(months=1)
            counts = Incident.objects.filter(
                organization_id=org_id,
                is_deleted=False,
                date_of_incident__gte=cursor,
                date_of_incident__lt=month_end,
            ).aggregate(
                total=Count('id'),
                lti=Count('id', filter=Q(incident_type=IncidentType.LOST_TIME_INJURY)),
                near_miss=Count('id', filter=Q(incident_type=IncidentType.NEAR_MISS)),
                recordable=Count('id', filter=Q(incident_type__in=RECORDABLE_TYPES)),
            )
            results.append({
                'period': cursor.strftime('%Y-%m'),
                'label': cursor.strftime('%b %Y'),
                **counts,
            })
            cursor = month_end
        return results

    def _empty(self):
        return {
            'period': {}, 'hours_worked': None,
            'kpis': {
                'total_incidents': 0, 'lti_count': 0, 'fatality_count': 0,
                'near_miss_count': 0, 'recordable_count': 0, 'critical_count': 0,
                'high_count': 0, 'ltifr': None, 'trifr': None,
            },
            'by_type': [], 'by_severity': [], 'monthly_trend': [],
            'ca_metrics': {'total': 0, 'closed': 0, 'overdue': 0, 'closure_rate': 0},
            'investigation_metrics': {'total': 0, 'closed': 0, 'closure_rate': 0},
        }
