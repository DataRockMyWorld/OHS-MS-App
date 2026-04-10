import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

from .constants import IncidentType, IncidentSeverity, IncidentStatus


def incident_attachment_upload_path(instance, filename):
    return (
        f"organizations/{instance.organization_id}"
        f"/incidents/{instance.incident_id}"
        f"/attachments/{filename}"
    )


class IncidentQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_deleted=False)

    def for_organization(self, organization):
        return self.filter(organization=organization)

    def by_status(self, status):
        return self.filter(status=status)


class IncidentManager(models.Manager):
    def get_queryset(self):
        return IncidentQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()

    def for_organization(self, organization):
        return self.get_queryset().for_organization(organization)


class Incident(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='incidents',
    )

    # Auto-generated human-readable reference (e.g. INC-2024-0042)
    reference_number = models.CharField(max_length=20, unique=True, blank=True, db_index=True)

    # Core incident info
    title = models.CharField(max_length=255)
    incident_type = models.CharField(max_length=30, choices=IncidentType.choices, db_index=True)
    date_of_incident = models.DateField()
    time_of_incident = models.TimeField(null=True, blank=True)

    # Location context
    site = models.ForeignKey(
        'core.Site',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incidents',
    )
    location_detail = models.CharField(max_length=255, blank=True)
    department = models.ForeignKey(
        'core.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incidents',
    )

    # Incident narrative
    description = models.TextField()
    persons_involved = models.JSONField(default=list, blank=True)
    witnesses = models.JSONField(default=list, blank=True)
    immediate_action_taken = models.TextField(blank=True)

    # Impact flags
    injury_occurred = models.BooleanField(default=False)
    environmental_impact = models.BooleanField(default=False)
    property_damage = models.BooleanField(default=False)

    # Severity
    severity = models.CharField(
        max_length=10,
        choices=IncidentSeverity.choices,
        default=IncidentSeverity.LOW,
        db_index=True,
    )

    # Workflow status
    status = models.CharField(
        max_length=30,
        choices=IncidentStatus.choices,
        default=IncidentStatus.DRAFT,
        db_index=True,
    )

    # Reporting
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='reported_incidents',
    )
    report_date = models.DateTimeField(null=True, blank=True)

    # Assignment / review
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_incidents',
    )
    assigned_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_incidents',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    closed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='closed_incidents',
    )
    closed_at = models.DateTimeField(null=True, blank=True)
    closure_notes = models.TextField(blank=True)

    # Forward-compatible hook for the Investigation module
    investigation_id = models.UUIDField(null=True, blank=True)

    # Soft delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_incidents',
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = IncidentManager()

    class Meta:
        db_table = 'incidents_incident'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'created_at']),
            models.Index(fields=['organization', 'incident_type']),
            models.Index(fields=['organization', 'severity']),
            models.Index(fields=['reported_by', 'organization']),
        ]

    def __str__(self):
        return f"{self.reference_number} — {self.title}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self._generate_reference_number()
        super().save(*args, **kwargs)

    def _generate_reference_number(self) -> str:
        year = timezone.now().year
        count = Incident.objects.filter(
            organization=self.organization,
            created_at__year=year,
        ).count()
        return f"INC-{year}-{str(count + 1).zfill(4)}"

    @property
    def attachment_count(self) -> int:
        return self.attachments.count()


class IncidentAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    # Denormalized so we can query all org attachments without joining Incident
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='incident_attachments',
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='uploaded_incident_attachments',
    )

    file = models.FileField(upload_to=incident_attachment_upload_path)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    file_size = models.PositiveIntegerField()  # bytes
    caption = models.CharField(max_length=500, blank=True)
    is_photo = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'incidents_attachment'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.file_name} ({self.incident.reference_number})"


class IncidentStatusHistory(models.Model):
    """
    Immutable audit trail. Never updated — only appended.
    One record is written for every status transition (including creation as draft).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    # Denormalized for org-scoped history queries
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='incident_status_history',
    )

    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='incident_status_changes',
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'incidents_status_history'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['incident', 'created_at']),
        ]

    def __str__(self):
        return (
            f"{self.incident.reference_number}: "
            f"{self.from_status or '—'} → {self.to_status}"
        )


class AnonymousIncidentReport(models.Model):
    """
    Submitted via the public /report/<org_slug>/ page — no auth required.
    Kept separate from Incident so reported_by is never required on Incident.
    HSE managers review these and can convert to a proper Incident if warranted.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='anonymous_reports',
    )

    # What happened
    title = models.CharField(max_length=255)
    description = models.TextField()
    incident_type = models.CharField(max_length=30, choices=IncidentType.choices, default=IncidentType.NEAR_MISS)
    date_of_incident = models.DateField()
    location = models.CharField(max_length=255, blank=True, default='')
    immediate_action_taken = models.TextField(blank=True, default='')

    # Optional contact — reporter may choose to remain anonymous
    reporter_name = models.CharField(max_length=255, blank=True, default='')
    reporter_contact = models.CharField(max_length=255, blank=True, default='')

    # Review
    is_reviewed = models.BooleanField(default=False, db_index=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_anonymous_reports',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True, default='')

    # Link to a converted incident if reviewer promoted it
    converted_incident = models.OneToOneField(
        Incident,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='anonymous_source',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Anonymous report — {self.organization.name} — {self.title[:40]}"
