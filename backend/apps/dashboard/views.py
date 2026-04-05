"""
Dashboard API — returns all data required to render the executive safety dashboard
in a single round-trip.  No models, no migrations required.
"""
import logging
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

from django.utils import timezone
from django.db.models import Count, Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.incidents.models import Incident
from apps.incidents.constants import IncidentStatus, IncidentType
from apps.investigations.models import Investigation
from apps.investigations.constants import InvestigationStatus
from apps.corrective_actions.models import CorrectiveAction
from apps.corrective_actions.constants import CAStatus

logger = logging.getLogger(__name__)


def _incident_type_label(type_value: str) -> str:
    return dict(IncidentType.choices).get(type_value, type_value.replace('_', ' ').title())


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org_id = request.user.organization_id
        if not org_id:
            return Response(self._empty_payload())

        now = timezone.now()
        today = now.date()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        incidents_qs = Incident.objects.filter(organization_id=org_id, is_deleted=False)
        investigations_qs = Investigation.objects.filter(organization_id=org_id, is_deleted=False)
        ca_qs = CorrectiveAction.objects.filter(organization_id=org_id, is_deleted=False)

        open_statuses = [
            IncidentStatus.REPORTED,
            IncidentStatus.UNDER_REVIEW,
            IncidentStatus.INVESTIGATION_ONGOING,
            IncidentStatus.REOPENED,
        ]

        # ── KPIs ──────────────────────────────────────────────────────────────
        incident_kpis = incidents_qs.aggregate(
            incidents_this_month=Count('id', filter=Q(created_at__gte=month_start)),
            near_miss_this_month=Count('id', filter=Q(
                incident_type=IncidentType.NEAR_MISS,
                created_at__gte=month_start,
            )),
            lti_count=Count('id', filter=Q(
                incident_type=IncidentType.LOST_TIME_INJURY,
                is_deleted=False,
            )),
            open_incidents=Count('id', filter=Q(status__in=open_statuses)),
            critical_open=Count('id', filter=Q(
                severity='critical',
                status__in=open_statuses,
            )),
        )

        open_investigations = investigations_qs.filter(
            status__in=[
                InvestigationStatus.INITIATED,
                InvestigationStatus.IN_PROGRESS,
                InvestigationStatus.FINDINGS_RECORDED,
                InvestigationStatus.RECOMMENDATIONS_ISSUED,
            ]
        ).count()

        ca_kpis = ca_qs.aggregate(
            overdue_actions=Count('id', filter=Q(
                target_date__lt=today,
                status__in=[CAStatus.OPEN, CAStatus.IN_PROGRESS, CAStatus.REOPENED],
            )),
            pending_reviews=Count('id', filter=Q(status=CAStatus.IMPLEMENTED)),
        )

        kpis = {
            **incident_kpis,
            'open_investigations': open_investigations,
            **ca_kpis,
        }

        # ── Incident trend — rolling 6 months ─────────────────────────────────
        trend = []
        for i in range(5, -1, -1):
            period_start = (month_start - relativedelta(months=i)).replace(
                hour=0, minute=0, second=0, microsecond=0,
            )
            period_end = period_start + relativedelta(months=1)

            counts = incidents_qs.filter(
                created_at__gte=period_start,
                created_at__lt=period_end,
            ).aggregate(
                total=Count('id'),
                near_miss=Count('id', filter=Q(incident_type=IncidentType.NEAR_MISS)),
                injury=Count('id', filter=Q(incident_type__in=[
                    IncidentType.INJURY,
                    IncidentType.LOST_TIME_INJURY,
                    IncidentType.FATALITY,
                    IncidentType.FIRST_AID,
                    IncidentType.MEDICAL_TREATMENT,
                ])),
            )

            trend.append({
                'period': period_start.strftime('%Y-%m'),
                'label': period_start.strftime('%b'),
                **counts,
            })

        # ── Incidents by type ─────────────────────────────────────────────────
        by_type = (
            incidents_qs
            .values('incident_type')
            .annotate(count=Count('id'))
            .order_by('-count')[:8]
        )
        incidents_by_type = [
            {
                'type': row['incident_type'],
                'label': _incident_type_label(row['incident_type']),
                'count': row['count'],
            }
            for row in by_type
        ]

        # ── Recent open incidents ─────────────────────────────────────────────
        recent_open = (
            incidents_qs
            .filter(status__in=open_statuses)
            .select_related('reported_by')
            .order_by('-created_at')[:5]
        )
        recent_open_incidents = [
            {
                'id': str(inc.id),
                'reference_number': inc.reference_number,
                'title': inc.title,
                'severity': inc.severity,
                'status': inc.status,
                'status_display': inc.get_status_display(),
                'date_of_incident': inc.date_of_incident.isoformat(),
                'reported_by': inc.reported_by.get_full_name() or inc.reported_by.email,
                'days_open': (today - inc.date_of_incident).days,
            }
            for inc in recent_open
        ]

        # ── Overdue corrective actions ─────────────────────────────────────────
        overdue_cas = (
            ca_qs
            .filter(
                target_date__lt=today,
                status__in=[CAStatus.OPEN, CAStatus.IN_PROGRESS, CAStatus.REOPENED],
            )
            .select_related('assigned_to')
            .order_by('target_date')[:5]
        )
        overdue_actions = [
            {
                'id': str(ca.id),
                'reference_number': ca.reference_number,
                'title': ca.title,
                'priority': ca.priority,
                'status': ca.status,
                'target_date': ca.target_date.isoformat(),
                'days_overdue': (today - ca.target_date).days,
                'assigned_to': (
                    ca.assigned_to.get_full_name() or ca.assigned_to.email
                    if ca.assigned_to else None
                ),
            }
            for ca in overdue_cas
        ]

        return Response({
            'kpis': kpis,
            'incident_trend': trend,
            'incidents_by_type': incidents_by_type,
            'recent_open_incidents': recent_open_incidents,
            'overdue_actions': overdue_actions,
        })

    def _empty_payload(self):
        now = timezone.now()
        trend = []
        for i in range(5, -1, -1):
            period_start = (now.replace(day=1) - relativedelta(months=i))
            trend.append({
                'period': period_start.strftime('%Y-%m'),
                'label': period_start.strftime('%b'),
                'total': 0, 'near_miss': 0, 'injury': 0,
            })
        return {
            'kpis': {
                'incidents_this_month': 0, 'near_miss_this_month': 0,
                'lti_count': 0, 'open_incidents': 0, 'critical_open': 0,
                'open_investigations': 0, 'overdue_actions': 0, 'pending_reviews': 0,
            },
            'incident_trend': trend,
            'incidents_by_type': [],
            'recent_open_incidents': [],
            'overdue_actions': [],
        }
