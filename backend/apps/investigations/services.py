"""
InvestigationService — all business logic for the Investigations module.

Rules:
- All state transitions are validated here, not in views or serializers.
- Every status change writes an InvestigationStatusHistory record.
- When an investigation is opened from an incident, the incident's investigation_id is updated.
- Services raise typed exceptions; views catch them and return appropriate HTTP responses.
"""
import logging
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Investigation, RootCause, InvestigationTeamMember, InvestigationStatusHistory
from .constants import (
    InvestigationStatus,
    VALID_STATUS_TRANSITIONS,
    TRANSITION_PERMITTED_ROLES,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class InvestigationServiceError(Exception):
    pass


class InvalidStatusTransitionError(InvestigationServiceError):
    pass


class TransitionPermissionError(InvestigationServiceError):
    pass


class InvestigationService:

    @staticmethod
    @transaction.atomic
    def create_investigation(*, data: dict, created_by: User) -> Investigation:
        """
        Create a new investigation in INITIATED status.
        If an incident is linked, updates the incident's investigation_id.
        """
        investigation = Investigation(
            **data,
            created_by=created_by,
            organization=created_by.organization,
            status=InvestigationStatus.INITIATED,
        )
        investigation.save()

        # Write initial status history
        InvestigationStatusHistory.objects.create(
            investigation=investigation,
            organization=investigation.organization,
            from_status='',
            to_status=InvestigationStatus.INITIATED,
            changed_by=created_by,
            comment='Investigation opened.',
        )

        # Link back to the incident if provided
        if investigation.incident:
            investigation.incident.investigation_id = investigation.id
            investigation.incident.save(update_fields=['investigation_id', 'updated_at'])

        logger.info(
            'Investigation created',
            extra={
                'investigation_id': str(investigation.id),
                'reference': investigation.reference_number,
                'org_id': str(investigation.organization_id),
                'created_by': str(created_by.id),
                'incident_id': str(investigation.incident_id) if investigation.incident_id else None,
            },
        )
        return investigation

    @staticmethod
    @transaction.atomic
    def transition_status(
        *,
        investigation: Investigation,
        new_status: str,
        changed_by: User,
        comment: str = '',
        bypass_role_check: bool = False,
    ) -> Investigation:
        """
        Validate and execute a status transition.
        Writes an InvestigationStatusHistory record on every successful transition.
        """
        current_status = investigation.status

        # 1. Validate the transition is structurally valid
        allowed_transitions = VALID_STATUS_TRANSITIONS.get(current_status, [])
        if new_status not in allowed_transitions:
            raise InvalidStatusTransitionError(
                f"Cannot transition from '{current_status}' to '{new_status}'. "
                f"Allowed: {allowed_transitions}"
            )

        # 2. Validate role is permitted to trigger this target status
        if not bypass_role_check:
            permitted_roles = TRANSITION_PERMITTED_ROLES.get(new_status, [])
            if changed_by.role not in permitted_roles:
                raise TransitionPermissionError(
                    f"Role '{changed_by.role}' is not permitted to transition "
                    f"an investigation to '{new_status}'."
                )

        old_status = investigation.status
        now = timezone.now()

        update_fields = ['status', 'updated_at']
        investigation.status = new_status

        if new_status == InvestigationStatus.CLOSED:
            investigation.closed_by = changed_by
            investigation.closed_at = now
            investigation.actual_completion_date = now.date()
            update_fields += ['closed_by', 'closed_at', 'actual_completion_date']

        elif new_status == InvestigationStatus.INITIATED:
            # Reopened — clear closure fields
            investigation.closed_by = None
            investigation.closed_at = None
            investigation.actual_completion_date = None
            update_fields += ['closed_by', 'closed_at', 'actual_completion_date']

        investigation.save(update_fields=update_fields)

        # Write audit record
        InvestigationStatusHistory.objects.create(
            investigation=investigation,
            organization=investigation.organization,
            from_status=old_status,
            to_status=new_status,
            changed_by=changed_by,
            comment=comment,
        )

        logger.info(
            'Investigation status transitioned',
            extra={
                'investigation_id': str(investigation.id),
                'reference': investigation.reference_number,
                'from_status': old_status,
                'to_status': new_status,
                'changed_by': str(changed_by.id),
            },
        )
        return investigation

    @staticmethod
    @transaction.atomic
    def add_team_member(*, investigation: Investigation, user: User) -> InvestigationTeamMember:
        if user.organization_id != investigation.organization_id:
            raise InvestigationServiceError(
                'Team member must belong to the same organization as the investigation.'
            )
        member, _ = InvestigationTeamMember.objects.get_or_create(
            investigation=investigation,
            user=user,
        )
        return member

    @staticmethod
    @transaction.atomic
    def remove_team_member(*, investigation: Investigation, user: User) -> None:
        InvestigationTeamMember.objects.filter(
            investigation=investigation,
            user=user,
        ).delete()

    @staticmethod
    @transaction.atomic
    def add_root_cause(*, investigation: Investigation, data: dict) -> RootCause:
        return RootCause.objects.create(
            investigation=investigation,
            organization=investigation.organization,
            **data,
        )

    @staticmethod
    @transaction.atomic
    def soft_delete(*, investigation: Investigation, deleted_by: User) -> None:
        investigation.is_deleted = True
        investigation.deleted_at = timezone.now()
        investigation.deleted_by = deleted_by
        investigation.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by', 'updated_at'])

        # Unlink from incident so incident no longer shows an active investigation
        if investigation.incident:
            investigation.incident.investigation_id = None
            investigation.incident.save(update_fields=['investigation_id', 'updated_at'])

    @staticmethod
    def auto_advance(investigation: Investigation) -> None:
        """
        Fire one status step forward if the data conditions are met. Idempotent.
        Called after every PATCH and after a root cause is added.
        """
        current = investigation.status
        target = None

        if current == InvestigationStatus.INITIATED:
            if investigation.scope and investigation.timeline_of_events:
                target = InvestigationStatus.IN_PROGRESS

        elif current == InvestigationStatus.IN_PROGRESS:
            if investigation.root_causes.exists() and investigation.findings:
                target = InvestigationStatus.FINDINGS_RECORDED

        elif current == InvestigationStatus.FINDINGS_RECORDED:
            if investigation.recommendations:
                target = InvestigationStatus.RECOMMENDATIONS_ISSUED

        if target:
            InvestigationService.transition_status(
                investigation=investigation,
                new_status=target,
                changed_by=investigation.lead_investigator,
                comment='Auto-advanced by system.',
                bypass_role_check=True,
            )

    @staticmethod
    def check_cascade_close(investigation: Investigation) -> None:
        """
        Close the investigation if it is in RECOMMENDATIONS_ISSUED and all linked
        corrective actions are now closed. Called by CAService after a CA closes.
        """
        from apps.corrective_actions.constants import CAStatus

        if investigation.status != InvestigationStatus.RECOMMENDATIONS_ISSUED:
            return
        linked = investigation.corrective_actions.all()
        if linked.exists() and not linked.exclude(status=CAStatus.CLOSED).exists():
            InvestigationService.transition_status(
                investigation=investigation,
                new_status=InvestigationStatus.CLOSED,
                changed_by=investigation.lead_investigator,
                comment='Auto-closed: all corrective actions completed.',
                bypass_role_check=True,
            )

    @staticmethod
    def get_organization_stats(organization_id) -> dict:
        from django.db.models import Count, Q

        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        base_qs = Investigation.objects.filter(
            organization_id=organization_id,
            is_deleted=False,
        )

        return base_qs.aggregate(
            total=Count('id'),
            this_month=Count('id', filter=Q(created_at__gte=this_month_start)),
            open_count=Count('id', filter=Q(status__in=[
                InvestigationStatus.INITIATED,
                InvestigationStatus.IN_PROGRESS,
                InvestigationStatus.FINDINGS_RECORDED,
                InvestigationStatus.RECOMMENDATIONS_ISSUED,
            ])),
            in_progress_count=Count('id', filter=Q(status=InvestigationStatus.IN_PROGRESS)),
            closed_count=Count('id', filter=Q(status=InvestigationStatus.CLOSED)),
            overdue_count=Count('id', filter=Q(
                target_completion_date__lt=now.date(),
                status__in=[
                    InvestigationStatus.INITIATED,
                    InvestigationStatus.IN_PROGRESS,
                    InvestigationStatus.FINDINGS_RECORDED,
                ],
            )),
        )
