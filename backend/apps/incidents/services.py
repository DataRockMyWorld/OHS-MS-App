"""
IncidentService — all business logic for the Incident Management module.

Rules:
- All state transitions are validated here, not in views or serializers.
- Every status change writes an IncidentStatusHistory record.
- Services raise typed exceptions; views catch them and return appropriate HTTP responses.
- Services are called from views, management commands, and Celery tasks — never from serializers.
"""
import logging
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Incident, IncidentAttachment, IncidentStatusHistory
from .constants import (
    IncidentStatus,
    VALID_STATUS_TRANSITIONS,
    TRANSITION_PERMITTED_ROLES,
    ALLOWED_ATTACHMENT_MIME_TYPES,
    MAX_ATTACHMENT_SIZE_BYTES,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class IncidentServiceError(Exception):
    pass


class InvalidStatusTransitionError(IncidentServiceError):
    pass


class TransitionPermissionError(IncidentServiceError):
    pass


class AttachmentValidationError(IncidentServiceError):
    pass


class IncidentService:

    @staticmethod
    @transaction.atomic
    def create_incident(*, data: dict, reporter: User) -> Incident:
        """
        Create a new incident record in DRAFT status.
        The signal handler writes the initial status history entry.
        """
        incident = Incident(
            **data,
            reported_by=reporter,
            organization=reporter.organization,
            status=IncidentStatus.DRAFT,
        )
        incident.save()

        logger.info(
            "Incident created",
            extra={
                'incident_id': str(incident.id),
                'reference': incident.reference_number,
                'org_id': str(incident.organization_id),
                'reporter_id': str(reporter.id),
            },
        )
        return incident

    @staticmethod
    @transaction.atomic
    def submit_incident(*, incident: Incident, submitted_by: User) -> Incident:
        """
        Convenience method: transition DRAFT → REPORTED.
        The reporter submits their own incident.
        """
        return IncidentService.transition_status(
            incident=incident,
            new_status=IncidentStatus.REPORTED,
            changed_by=submitted_by,
            comment='Incident submitted for review.',
            bypass_role_check=True,  # Reporter submits their own draft
        )

    @staticmethod
    @transaction.atomic
    def transition_status(
        *,
        incident: Incident,
        new_status: str,
        changed_by: User,
        comment: str = '',
        bypass_role_check: bool = False,
    ) -> Incident:
        """
        Validate and execute a status transition.
        Writes a IncidentStatusHistory record on every successful transition.
        """
        current_status = incident.status

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
                    f"an incident to '{new_status}'."
                )

        old_status = incident.status
        now = timezone.now()

        # 3. Apply side-effects for specific transitions
        update_fields = ['status', 'updated_at']
        incident.status = new_status

        if new_status == IncidentStatus.REPORTED:
            incident.report_date = now
            update_fields.append('report_date')

        elif new_status == IncidentStatus.UNDER_REVIEW:
            incident.reviewed_by = changed_by
            incident.reviewed_at = now
            update_fields += ['reviewed_by', 'reviewed_at']

        elif new_status == IncidentStatus.CLOSED:
            incident.closed_by = changed_by
            incident.closed_at = now
            update_fields += ['closed_by', 'closed_at']

        incident.save(update_fields=update_fields)

        # 4. Write audit record
        IncidentStatusHistory.objects.create(
            incident=incident,
            organization=incident.organization,
            from_status=old_status,
            to_status=new_status,
            changed_by=changed_by,
            comment=comment,
        )

        logger.info(
            "Incident status transitioned",
            extra={
                'incident_id': str(incident.id),
                'reference': incident.reference_number,
                'from_status': old_status,
                'to_status': new_status,
                'changed_by': str(changed_by.id),
            },
        )
        return incident

    @staticmethod
    @transaction.atomic
    def assign_incident(
        *,
        incident: Incident,
        assignee: User,
        assigned_by: User,
        comment: str = '',
    ) -> Incident:
        """
        Assign an incident to a user within the same organization.
        Does not change the incident status.
        """
        if assignee.organization_id != incident.organization_id:
            raise IncidentServiceError(
                "Assignee must belong to the same organization as the incident."
            )

        incident.assigned_to = assignee
        incident.assigned_at = timezone.now()
        incident.save(update_fields=['assigned_to', 'assigned_at', 'updated_at'])

        # Write an audit note
        IncidentStatusHistory.objects.create(
            incident=incident,
            organization=incident.organization,
            from_status=incident.status,
            to_status=incident.status,
            changed_by=assigned_by,
            comment=comment or f"Assigned to {assignee.get_full_name() or assignee.email}.",
        )

        return incident

    @staticmethod
    @transaction.atomic
    def soft_delete(*, incident: Incident, deleted_by: User) -> None:
        incident.is_deleted = True
        incident.deleted_at = timezone.now()
        incident.deleted_by = deleted_by
        incident.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by', 'updated_at'])

    @staticmethod
    def add_attachment(
        *,
        incident: Incident,
        file,
        uploaded_by: User,
        caption: str = '',
    ) -> IncidentAttachment:
        """
        Validate and attach a file to an incident.
        """
        if file.content_type not in ALLOWED_ATTACHMENT_MIME_TYPES:
            raise AttachmentValidationError(
                f"File type '{file.content_type}' is not allowed. "
                f"Allowed types: {', '.join(sorted(ALLOWED_ATTACHMENT_MIME_TYPES))}"
            )

        if file.size > MAX_ATTACHMENT_SIZE_BYTES:
            mb = MAX_ATTACHMENT_SIZE_BYTES // (1024 * 1024)
            raise AttachmentValidationError(
                f"File size exceeds the {mb}MB limit."
            )

        is_photo = file.content_type.startswith('image/')

        return IncidentAttachment.objects.create(
            incident=incident,
            organization=incident.organization,
            uploaded_by=uploaded_by,
            file=file,
            file_name=file.name,
            file_type=file.content_type,
            file_size=file.size,
            caption=caption,
            is_photo=is_photo,
        )

    @staticmethod
    def get_organization_stats(organization_id) -> dict:
        from django.db.models import Count, Q

        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        base_qs = Incident.objects.filter(
            organization_id=organization_id,
            is_deleted=False,
        )

        return base_qs.aggregate(
            total=Count('id'),
            this_month=Count('id', filter=Q(created_at__gte=this_month_start)),
            open_count=Count('id', filter=Q(status__in=[
                IncidentStatus.REPORTED,
                IncidentStatus.UNDER_REVIEW,
                IncidentStatus.INVESTIGATION_ONGOING,
                IncidentStatus.REOPENED,
            ])),
            under_review_count=Count('id', filter=Q(status=IncidentStatus.UNDER_REVIEW)),
            investigation_count=Count('id', filter=Q(status=IncidentStatus.INVESTIGATION_ONGOING)),
            closed_count=Count('id', filter=Q(status=IncidentStatus.CLOSED)),
            critical_count=Count('id', filter=Q(severity='critical', status__in=[
                IncidentStatus.REPORTED,
                IncidentStatus.UNDER_REVIEW,
                IncidentStatus.INVESTIGATION_ONGOING,
            ])),
        )
