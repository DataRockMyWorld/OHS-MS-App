import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

from .constants import CAStatus, CAPriority, CAType, CASource, EffectivenessRating


class CorrectiveActionQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_deleted=False)

    def for_organization(self, organization):
        return self.filter(organization=organization)


class CorrectiveActionManager(models.Manager):
    def get_queryset(self):
        return CorrectiveActionQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()

    def for_organization(self, organization):
        return self.get_queryset().for_organization(organization)


class CorrectiveAction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='corrective_actions',
    )

    # Auto-generated human-readable reference (e.g. CA-2024-0001)
    reference_number = models.CharField(max_length=20, unique=True, blank=True, db_index=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')

    action_type = models.CharField(
        max_length=20, choices=CAType.choices, default=CAType.CORRECTIVE,
    )
    priority = models.CharField(
        max_length=10, choices=CAPriority.choices, default=CAPriority.MEDIUM,
    )
    status = models.CharField(
        max_length=20, choices=CAStatus.choices, default=CAStatus.OPEN, db_index=True,
    )

    # Source
    source_type = models.CharField(
        max_length=20, choices=CASource.choices, default=CASource.OTHER,
    )
    source_investigation = models.ForeignKey(
        'investigations.Investigation',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='corrective_actions',
    )
    source_incident = models.ForeignKey(
        'incidents.Incident',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='corrective_actions',
    )

    # Assignment
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_corrective_actions',
    )

    # Content
    planned_action = models.TextField(blank=True, default='')
    implementation_notes = models.TextField(blank=True, default='')
    implementation_evidence = models.TextField(blank=True, default='')

    # Dates
    target_date = models.DateField(null=True, blank=True)
    implementation_date = models.DateField(null=True, blank=True)

    # Closure
    closed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='closed_corrective_actions',
    )
    closed_at = models.DateTimeField(null=True, blank=True)

    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_corrective_actions',
    )
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='deleted_corrective_actions',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CorrectiveActionManager()

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'is_deleted']),
            models.Index(fields=['assigned_to', 'status']),
        ]

    def __str__(self):
        return f"{self.reference_number} — {self.title}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self._generate_reference()
        super().save(*args, **kwargs)

    def _generate_reference(self) -> str:
        year = timezone.now().year
        prefix = f"CA-{year}-"
        last = (
            CorrectiveAction.objects
            .filter(reference_number__startswith=prefix)
            .order_by('-reference_number')
            .values_list('reference_number', flat=True)
            .first()
        )
        if last:
            try:
                seq = int(last.split('-')[-1]) + 1
            except (ValueError, IndexError):
                seq = 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"

    @property
    def is_overdue(self) -> bool:
        if self.target_date and self.status not in (CAStatus.CLOSED,):
            return self.target_date < timezone.now().date()
        return False


class CorrectiveActionStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    corrective_action = models.ForeignKey(
        CorrectiveAction,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='ca_status_history',
    )
    from_status = models.CharField(max_length=20, blank=True, default='')
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='ca_status_changes',
    )
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.corrective_action.reference_number}: {self.from_status} → {self.to_status}"


class EffectivenessReview(models.Model):
    """
    Records a single effectiveness review event for a corrective action.
    Multiple reviews are possible if the CA cycles back to in_progress.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    corrective_action = models.ForeignKey(
        CorrectiveAction,
        on_delete=models.CASCADE,
        related_name='effectiveness_reviews',
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='effectiveness_reviews',
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='effectiveness_reviews_conducted',
    )
    review_date = models.DateField()
    rating = models.CharField(max_length=25, choices=EffectivenessRating.choices)
    evidence_description = models.TextField(blank=True, default='')
    notes = models.TextField(blank=True, default='')
    next_review_date = models.DateField(
        null=True, blank=True,
        help_text='Required when rating is Partially Effective or Not Effective.',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-review_date', '-created_at']

    def __str__(self):
        return (
            f"{self.corrective_action.reference_number} — "
            f"{self.get_rating_display()} on {self.review_date}"
        )
