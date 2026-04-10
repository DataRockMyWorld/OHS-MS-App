import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

from .constants import AuditType, AuditStatus, FindingSeverity, FindingStatus


class Audit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='audits',
    )

    # Human-readable ref e.g. AUD-2026-0001
    reference_number = models.CharField(max_length=20, unique=True, blank=True, db_index=True)

    title = models.CharField(max_length=255)
    audit_type = models.CharField(max_length=30, choices=AuditType.choices, default=AuditType.INTERNAL)
    status = models.CharField(max_length=20, choices=AuditStatus.choices, default=AuditStatus.PLANNED, db_index=True)

    scope = models.TextField(blank=True, default='')
    objectives = models.TextField(blank=True, default='')
    criteria = models.TextField(blank=True, default='', help_text='Standards / clauses being audited against')

    # Schedule
    planned_date = models.DateField()
    actual_date = models.DateField(null=True, blank=True)
    department = models.ForeignKey(
        'core.Department',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='audits',
    )
    location = models.CharField(max_length=255, blank=True, default='')

    # People
    lead_auditor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='led_audits',
    )
    auditee = models.CharField(max_length=255, blank=True, default='', help_text='Person / team / area being audited')

    # Conclusions (filled on completion)
    summary = models.TextField(blank=True, default='')
    overall_conclusion = models.TextField(blank=True, default='')
    completed_at = models.DateTimeField(null=True, blank=True)

    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_audits',
    )
    is_deleted = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-planned_date', '-created_at']

    def __str__(self):
        return f"{self.reference_number} — {self.title}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self._generate_reference()
        super().save(*args, **kwargs)

    def _generate_reference(self) -> str:
        year = timezone.now().year
        prefix = f"AUD-{year}-"
        last = (
            Audit.objects
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


class AuditFinding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audit = models.ForeignKey(
        Audit,
        on_delete=models.CASCADE,
        related_name='findings',
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    severity = models.CharField(
        max_length=20,
        choices=FindingSeverity.choices,
        default=FindingSeverity.OBSERVATION,
    )
    status = models.CharField(
        max_length=10,
        choices=FindingStatus.choices,
        default=FindingStatus.OPEN,
    )

    clause_reference = models.CharField(
        max_length=100, blank=True, default='',
        help_text='e.g. ISO 45001 Clause 9.2.2',
    )
    evidence = models.TextField(blank=True, default='')
    recommended_action = models.TextField(blank=True, default='')

    # Link to CA once raised
    corrective_action = models.OneToOneField(
        'corrective_actions.CorrectiveAction',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='audit_finding',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.audit.reference_number} — {self.title}"
