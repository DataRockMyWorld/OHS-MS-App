import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

from .constants import InvestigationStatus, RCAMethod, RootCauseCategory


class InvestigationQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_deleted=False)

    def for_organization(self, organization):
        return self.filter(organization=organization)

    def by_status(self, status):
        return self.filter(status=status)


class InvestigationManager(models.Manager):
    def get_queryset(self):
        return InvestigationQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()

    def for_organization(self, organization):
        return self.get_queryset().for_organization(organization)


class Investigation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='investigations',
    )

    # Auto-generated human-readable reference (e.g. INV-2024-0001)
    reference_number = models.CharField(max_length=20, unique=True, blank=True, db_index=True)

    # Core fields
    title = models.CharField(max_length=255)
    status = models.CharField(
        max_length=30,
        choices=InvestigationStatus.choices,
        default=InvestigationStatus.INITIATED,
        db_index=True,
    )

    # Optional link to a triggering incident (nullable for standalone investigations)
    incident = models.OneToOneField(
        'incidents.Incident',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='investigation',
    )

    # RCA methodology
    rca_method = models.CharField(
        max_length=20,
        choices=RCAMethod.choices,
        default=RCAMethod.FIVE_WHYS,
    )

    # Team
    lead_investigator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='led_investigations',
    )
    team_members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='InvestigationTeamMember',
        related_name='investigation_team_memberships',
        blank=True,
    )

    # Investigation narrative
    scope = models.TextField(blank=True, help_text='What this investigation covers and its boundaries.')
    timeline_of_events = models.TextField(blank=True, help_text='Chronological account of events.')
    immediate_causes = models.TextField(blank=True, help_text='Direct causes that led to the incident.')
    contributing_factors = models.TextField(blank=True, help_text='Conditions that allowed the causes to exist.')
    findings = models.TextField(blank=True, help_text='What the investigation determined.')
    lessons_learned = models.TextField(blank=True)
    recommendations = models.TextField(blank=True, help_text='Actions recommended to prevent recurrence.')

    # Dates
    target_completion_date = models.DateField(null=True, blank=True)
    actual_completion_date = models.DateField(null=True, blank=True)

    # Closure
    closed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='closed_investigations',
    )
    closed_at = models.DateTimeField(null=True, blank=True)

    # Authorship
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_investigations',
    )

    # Soft delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_investigations',
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = InvestigationManager()

    class Meta:
        db_table = 'investigations_investigation'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'created_at']),
            models.Index(fields=['lead_investigator', 'organization']),
        ]

    def __str__(self):
        return f"{self.reference_number} — {self.title}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self._generate_reference_number()
        super().save(*args, **kwargs)

    def _generate_reference_number(self) -> str:
        year = timezone.now().year
        count = Investigation.objects.filter(
            organization=self.organization,
            created_at__year=year,
        ).count()
        return f"INV-{year}-{str(count + 1).zfill(4)}"


class InvestigationTeamMember(models.Model):
    """Through model for the Investigation ↔ User M2M, capturing the role."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    investigation = models.ForeignKey(
        Investigation,
        on_delete=models.CASCADE,
        related_name='team_memberships',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='investigation_memberships',
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'investigations_team_member'
        unique_together = [('investigation', 'user')]
        ordering = ['added_at']

    def __str__(self):
        return f"{self.user.get_full_name()} on {self.investigation.reference_number}"


class RootCause(models.Model):
    """Structured root cause entry. One investigation may have several."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Denormalized for efficient org-scoped queries
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='root_causes',
    )
    investigation = models.ForeignKey(
        Investigation,
        on_delete=models.CASCADE,
        related_name='root_causes',
    )
    category = models.CharField(
        max_length=30,
        choices=RootCauseCategory.choices,
        db_index=True,
    )
    description = models.TextField()
    # For 5-Whys: stores ['Why 1', 'Why 2', ...] chain
    why_analysis = models.JSONField(default=list, blank=True)
    order = models.PositiveSmallIntegerField(default=0, help_text='Display ordering within an investigation.')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'investigations_root_cause'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.get_category_display()} — {self.investigation.reference_number}"


class InvestigationStatusHistory(models.Model):
    """
    Immutable audit trail. One record per status transition.
    Never updated — only appended.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    investigation = models.ForeignKey(
        Investigation,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='investigation_status_history',
    )
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='investigation_status_changes',
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'investigations_status_history'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['investigation', 'created_at']),
        ]

    def __str__(self):
        return (
            f"{self.investigation.reference_number}: "
            f"{self.from_status or '—'} → {self.to_status}"
        )
