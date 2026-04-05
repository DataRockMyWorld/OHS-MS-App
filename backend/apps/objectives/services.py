from decimal import Decimal
from datetime import date, timedelta
from collections import defaultdict

from django.utils import timezone

from apps.incidents.models import Incident
from apps.corrective_actions.models import CorrectiveAction
from apps.investigations.models import Investigation
from apps.accounts.models import User

from .models import Objective


class ObjectiveService:

    @staticmethod
    def _get_period_window(frequency: str) -> tuple[date, date]:
        """Return (start_date, end_date) for the given frequency relative to today."""
        today = timezone.now().date()
        if frequency == Objective.Frequency.MONTHLY:
            start = today.replace(day=1)
        elif frequency == Objective.Frequency.QUARTERLY:
            # First month of current quarter
            quarter_start_month = ((today.month - 1) // 3) * 3 + 1
            start = today.replace(month=quarter_start_month, day=1)
        else:  # bi_annually
            start = today - timedelta(days=182)
        return start, today

    @staticmethod
    def compute_metric(organization_id, linked_metric: str, frequency: str) -> Decimal:
        """Compute the current value for a system-linked metric."""
        today = timezone.now().date()
        start, end = ObjectiveService._get_period_window(frequency)

        if linked_metric == Objective.LinkedMetric.NEAR_MISS_COUNT:
            return Decimal(
                Incident.objects.filter(
                    organization_id=organization_id,
                    incident_type='near_miss',
                    date_of_incident__gte=start,
                    date_of_incident__lte=end,
                    is_deleted=False,
                ).count()
            )

        elif linked_metric == Objective.LinkedMetric.TOTAL_INCIDENT_COUNT:
            return Decimal(
                Incident.objects.filter(
                    organization_id=organization_id,
                    date_of_incident__gte=start,
                    date_of_incident__lte=end,
                    is_deleted=False,
                ).exclude(status='draft').count()
            )

        elif linked_metric == Objective.LinkedMetric.INJURY_COUNT:
            return Decimal(
                Incident.objects.filter(
                    organization_id=organization_id,
                    injury_occurred=True,
                    date_of_incident__gte=start,
                    date_of_incident__lte=end,
                    is_deleted=False,
                ).count()
            )

        elif linked_metric == Objective.LinkedMetric.CRITICAL_INCIDENT_COUNT:
            return Decimal(
                Incident.objects.filter(
                    organization_id=organization_id,
                    severity='critical',
                    date_of_incident__gte=start,
                    date_of_incident__lte=end,
                    is_deleted=False,
                ).exclude(status='draft').count()
            )

        elif linked_metric == Objective.LinkedMetric.OPEN_INCIDENT_COUNT:
            # Point-in-time — no date filter
            return Decimal(
                Incident.objects.filter(
                    organization_id=organization_id,
                    status__in=[
                        'reported',
                        'under_review',
                        'investigation_ongoing',
                        'actions_implemented',
                    ],
                    is_deleted=False,
                ).count()
            )

        elif linked_metric == Objective.LinkedMetric.OVERDUE_CA_COUNT:
            # Point-in-time — no date filter
            return Decimal(
                CorrectiveAction.objects.filter(
                    organization_id=organization_id,
                    target_date__lt=today,
                    status__in=['open', 'in_progress', 'implemented'],
                    is_deleted=False,
                ).count()
            )

        elif linked_metric == Objective.LinkedMetric.CA_CLOSURE_RATE:
            # On-time closure rate: closed CAs where closed_at date <= target_date, in period
            closed_in_period = CorrectiveAction.objects.filter(
                organization_id=organization_id,
                status='closed',
                is_deleted=False,
                closed_at__date__gte=start,
                closed_at__date__lte=end,
            )
            total_closed = closed_in_period.count()
            if total_closed == 0:
                return Decimal('0')
            # Compare closed_at.date() <= target_date row-by-row in Python
            on_time_closed = sum(
                1 for ca in closed_in_period
                if ca.target_date and ca.closed_at and ca.closed_at.date() <= ca.target_date
            )
            rate = Decimal(on_time_closed) / Decimal(total_closed) * Decimal('100')
            return rate.quantize(Decimal('0.01'))

        elif linked_metric == Objective.LinkedMetric.OPEN_INVESTIGATION_COUNT:
            # Point-in-time — no date filter
            return Decimal(
                Investigation.objects.filter(
                    organization_id=organization_id,
                    status__in=[
                        'initiated',
                        'in_progress',
                        'findings_recorded',
                        'recommendations_issued',
                    ],
                    is_deleted=False,
                ).count()
            )

        # Manual — nothing to compute
        return Decimal('0')

    @staticmethod
    def derive_status(objective: Objective) -> str:
        """Derive the objective status from achievement percentage."""
        if objective.status == Objective.Status.CLOSED:
            return Objective.Status.CLOSED

        if objective.current_value is None:
            return objective.status

        current = Decimal(str(objective.current_value))
        baseline = Decimal(str(objective.baseline_value))
        target = Decimal(str(objective.target_value))
        direction = objective.direction

        try:
            if direction == Objective.Direction.INCREASE:
                denom = target - baseline
                if denom == 0:
                    pct = Decimal('100') if current >= target else Decimal('0')
                else:
                    pct = (current - baseline) / denom * Decimal('100')

            elif direction == Objective.Direction.DECREASE:
                denom = baseline - target
                if denom == 0:
                    pct = Decimal('100') if current <= target else Decimal('0')
                else:
                    pct = (baseline - current) / denom * Decimal('100')

            else:  # maintain
                divisor = max(abs(target), Decimal('0.001'))
                pct = Decimal('100') - abs(current - target) / divisor * Decimal('100')

        except Exception:
            return objective.status

        # Clamp to 0–100
        pct = max(Decimal('0'), min(Decimal('100'), pct))

        if pct >= Decimal('100'):
            return Objective.Status.ACHIEVED
        elif pct >= Decimal('70'):
            return Objective.Status.ON_TRACK
        elif pct >= Decimal('40'):
            return Objective.Status.AT_RISK
        else:
            return Objective.Status.BEHIND

    @staticmethod
    def get_achievement_pct(objective: Objective) -> float | None:
        """Return achievement percentage for an objective, or None if no current value."""
        if objective.current_value is None:
            return None

        current = Decimal(str(objective.current_value))
        baseline = Decimal(str(objective.baseline_value))
        target = Decimal(str(objective.target_value))
        direction = objective.direction

        try:
            if direction == Objective.Direction.INCREASE:
                denom = target - baseline
                if denom == 0:
                    pct = Decimal('100') if current >= target else Decimal('0')
                else:
                    pct = (current - baseline) / denom * Decimal('100')

            elif direction == Objective.Direction.DECREASE:
                denom = baseline - target
                if denom == 0:
                    pct = Decimal('100') if current <= target else Decimal('0')
                else:
                    pct = (baseline - current) / denom * Decimal('100')

            else:  # maintain
                divisor = max(abs(target), Decimal('0.001'))
                pct = Decimal('100') - abs(current - target) / divisor * Decimal('100')

        except Exception:
            return None

        pct = max(Decimal('0'), min(Decimal('100'), pct))
        return float(pct)

    @staticmethod
    def update_objective_after_measurement(objective: Objective, value: Decimal) -> None:
        """Update objective current value and re-derive status."""
        objective.current_value = value
        objective.status = ObjectiveService.derive_status(objective)
        objective.save()

    @staticmethod
    def get_league_table(organization_id, scope: str = 'individual') -> list[dict]:
        """
        Return a league table of owners sorted by weighted average achievement %.
        """
        objectives = (
            Objective.objects
            .filter(organization_id=organization_id, scope=scope)
            .select_related('owner')
        )

        # Group objectives by owner
        by_owner: dict = defaultdict(list)
        for obj in objectives:
            if obj.owner_id is not None:
                by_owner[obj.owner_id].append(obj)

        rows = []
        for user_id, objs in by_owner.items():
            owner = objs[0].owner
            total_weight = sum(o.weight for o in objs)

            if total_weight == 0:
                score = None
            else:
                weighted_sum = Decimal('0')
                all_have_value = True
                for o in objs:
                    pct = ObjectiveService.get_achievement_pct(o)
                    if pct is None:
                        all_have_value = False
                        break
                    weighted_sum += Decimal(str(pct)) * Decimal(str(o.weight))

                score = float(weighted_sum / Decimal(str(total_weight))) if all_have_value else None

            on_track = sum(1 for o in objs if o.status == Objective.Status.ON_TRACK)
            at_risk = sum(1 for o in objs if o.status == Objective.Status.AT_RISK)
            behind = sum(1 for o in objs if o.status == Objective.Status.BEHIND)
            achieved = sum(1 for o in objs if o.status == Objective.Status.ACHIEVED)

            rows.append({
                'user_id': str(user_id),
                'full_name': owner.get_full_name() or owner.email,
                'email': owner.email,
                'job_title': owner.job_title or None,
                'score': score,
                'objective_count': len(objs),
                'on_track': on_track,
                'at_risk': at_risk,
                'behind': behind,
                'achieved': achieved,
            })

        # Sort descending by score; None scores go to the bottom
        rows.sort(key=lambda r: (r['score'] is None, -(r['score'] or 0)))
        return rows


