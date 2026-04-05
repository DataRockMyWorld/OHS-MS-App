"""
CorrectiveActionService — all business logic for the Corrective Actions module.

Rules:
- All state transitions are validated here, not in views or serializers.
- Every status change writes a CorrectiveActionStatusHistory record.
- Closing a CA (IMPLEMENTED → CLOSED) requires at least one EffectivenessReview on record.
- Adding an EffectivenessReview automatically drives the status:
    - fully_effective   → CLOSED
    - partially/not     → IN_PROGRESS  (cycles back for remediation)
- Services raise typed exceptions; views catch them and return appropriate HTTP responses.
"""
import logging
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import CorrectiveAction, CorrectiveActionStatusHistory, EffectivenessReview
from .constants import (
    CAStatus,
    EffectivenessRating,
    VALID_STATUS_TRANSITIONS,
    TRANSITION_PERMITTED_ROLES,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class CAServiceError(Exception):
    pass


class InvalidStatusTransitionError(CAServiceError):
    pass


class TransitionPermissionError(CAServiceError):
    pass


class EffectivenessReviewError(CAServiceError):
    pass


class CorrectiveActionService:

    @staticmethod
    @transaction.atomic
    def create_ca(*, data: dict, created_by: User) -> CorrectiveAction:
        """Create a new corrective action in OPEN status."""
        ca = CorrectiveAction(
            **data,
            created_by=created_by,
            organization=created_by.organization,
            status=CAStatus.OPEN,
        )
        ca.save()

        CorrectiveActionStatusHistory.objects.create(
            corrective_action=ca,
            organization=ca.organization,
            from_status='',
            to_status=CAStatus.OPEN,
            changed_by=created_by,
            comment='Corrective action raised.',
        )

        logger.info(
            'CorrectiveAction created',
            extra={
                'ca_id': str(ca.id),
                'reference': ca.reference_number,
                'org_id': str(ca.organization_id),
                'created_by': str(created_by.id),
            },
        )
        return ca

    @staticmethod
    @transaction.atomic
    def transition_status(
        *,
        ca: CorrectiveAction,
        new_status: str,
        changed_by: User,
        comment: str = '',
    ) -> CorrectiveAction:
        """Validate and execute a status transition."""
        current_status = ca.status

        allowed_transitions = VALID_STATUS_TRANSITIONS.get(current_status, [])
        if new_status not in allowed_transitions:
            raise InvalidStatusTransitionError(
                f"Cannot transition from '{current_status}' to '{new_status}'. "
                f"Allowed: {allowed_transitions}"
            )

        permitted_roles = TRANSITION_PERMITTED_ROLES.get(new_status, [])
        if permitted_roles and changed_by.role not in permitted_roles:
            raise TransitionPermissionError(
                f"Role '{changed_by.role}' is not permitted to transition "
                f"a corrective action to '{new_status}'."
            )

        # Closing requires at least one effectiveness review
        if new_status == CAStatus.CLOSED:
            if not ca.effectiveness_reviews.filter(
                rating=EffectivenessRating.FULLY_EFFECTIVE,
            ).exists():
                raise InvalidStatusTransitionError(
                    'A corrective action can only be closed after a '
                    '"Fully Effective" effectiveness review has been recorded.'
                )

        old_status = ca.status
        now = timezone.now()
        update_fields = ['status', 'updated_at']

        ca.status = new_status

        if new_status == CAStatus.CLOSED:
            ca.closed_by = changed_by
            ca.closed_at = now
            update_fields += ['closed_by', 'closed_at']
        elif new_status == CAStatus.OPEN:
            ca.closed_by = None
            ca.closed_at = None
            update_fields += ['closed_by', 'closed_at']

        ca.save(update_fields=update_fields)

        CorrectiveActionStatusHistory.objects.create(
            corrective_action=ca,
            organization=ca.organization,
            from_status=old_status,
            to_status=new_status,
            changed_by=changed_by,
            comment=comment,
        )

        logger.info(
            'CorrectiveAction status transitioned',
            extra={
                'ca_id': str(ca.id),
                'from_status': old_status,
                'to_status': new_status,
                'changed_by': str(changed_by.id),
            },
        )
        return ca

    @staticmethod
    @transaction.atomic
    def add_effectiveness_review(
        *,
        ca: CorrectiveAction,
        data: dict,
        reviewer: User,
    ) -> EffectivenessReview:
        """
        Record an effectiveness review and automatically drive the CA status:
        - fully_effective   → IMPLEMENTED stays as-is (user can then close manually)
        - partially/not     → back to IN_PROGRESS
        """
        if ca.status != CAStatus.IMPLEMENTED:
            raise EffectivenessReviewError(
                'Effectiveness reviews can only be added when the corrective action '
                f"is in '{CAStatus.IMPLEMENTED}' status. Current status: '{ca.status}'."
            )

        review = EffectivenessReview.objects.create(
            corrective_action=ca,
            organization=ca.organization,
            reviewer=reviewer,
            **data,
        )

        rating = review.rating

        if rating == EffectivenessRating.FULLY_EFFECTIVE:
            # Auto-close the CA — write history
            ca.status = CAStatus.CLOSED
            ca.closed_by = reviewer
            ca.closed_at = timezone.now()
            ca.save(update_fields=['status', 'closed_by', 'closed_at', 'updated_at'])

            CorrectiveActionStatusHistory.objects.create(
                corrective_action=ca,
                organization=ca.organization,
                from_status=CAStatus.IMPLEMENTED,
                to_status=CAStatus.CLOSED,
                changed_by=reviewer,
                comment=f'Closed automatically after Fully Effective review on {review.review_date}.',
            )
        else:
            # Cycle back to in_progress for further remediation
            ca.status = CAStatus.IN_PROGRESS
            ca.save(update_fields=['status', 'updated_at'])

            label = EffectivenessRating(rating).label
            CorrectiveActionStatusHistory.objects.create(
                corrective_action=ca,
                organization=ca.organization,
                from_status=CAStatus.IMPLEMENTED,
                to_status=CAStatus.IN_PROGRESS,
                changed_by=reviewer,
                comment=(
                    f'Returned to In Progress after effectiveness review '
                    f'rated "{label}" on {review.review_date}.'
                ),
            )

        logger.info(
            'EffectivenessReview recorded',
            extra={
                'ca_id': str(ca.id),
                'review_id': str(review.id),
                'rating': rating,
                'reviewer': str(reviewer.id),
            },
        )
        return review

    @staticmethod
    @transaction.atomic
    def soft_delete(*, ca: CorrectiveAction, deleted_by: User) -> None:
        ca.is_deleted = True
        ca.deleted_at = timezone.now()
        ca.deleted_by = deleted_by
        ca.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by', 'updated_at'])

    @staticmethod
    def get_organization_stats(organization_id) -> dict:
        from django.db.models import Count, Q

        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        base_qs = CorrectiveAction.objects.filter(
            organization_id=organization_id,
            is_deleted=False,
        )

        return base_qs.aggregate(
            total=Count('id'),
            this_month=Count('id', filter=Q(created_at__gte=this_month_start)),
            open_count=Count('id', filter=Q(status__in=[
                CAStatus.OPEN, CAStatus.IN_PROGRESS, CAStatus.IMPLEMENTED, CAStatus.REOPENED,
            ])),
            pending_review_count=Count('id', filter=Q(status=CAStatus.IMPLEMENTED)),
            closed_count=Count('id', filter=Q(status=CAStatus.CLOSED)),
            overdue_count=Count('id', filter=Q(
                target_date__lt=now.date(),
                status__in=[CAStatus.OPEN, CAStatus.IN_PROGRESS, CAStatus.REOPENED],
            )),
        )
