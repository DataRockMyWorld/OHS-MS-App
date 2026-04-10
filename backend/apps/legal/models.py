import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

from .constants import RequirementType, Jurisdiction, ComplianceStatus


class LegalRequirement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='legal_requirements',
    )

    # Human-readable ref e.g. LEG-2026-0001
    reference_number = models.CharField(max_length=20, unique=True, blank=True, db_index=True)

    title = models.CharField(max_length=255)
    requirement_type = models.CharField(
        max_length=25, choices=RequirementType.choices, default=RequirementType.LEGISLATION,
    )
    jurisdiction = models.CharField(
        max_length=20, choices=Jurisdiction.choices, default=Jurisdiction.NATIONAL,
    )

    # Detail
    description = models.TextField(blank=True, default='')
    applicable_clauses = models.CharField(
        max_length=500, blank=True, default='',
        help_text='Specific clauses, sections, or articles that apply',
    )
    source_url = models.URLField(blank=True, default='', help_text='Link to official document / register')

    # Applicability
    department = models.ForeignKey(
        'core.Department',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='legal_requirements',
    )
    responsible_person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='legal_requirements_owned',
    )

    # Compliance
    compliance_status = models.CharField(
        max_length=25, choices=ComplianceStatus.choices, default=ComplianceStatus.NOT_ASSESSED,
        db_index=True,
    )
    compliance_notes = models.TextField(blank=True, default='')
    compliance_evidence = models.TextField(blank=True, default='')

    # Dates
    effective_date = models.DateField(null=True, blank=True, help_text='When the requirement came into effect')
    review_date = models.DateField(null=True, blank=True, help_text='Next scheduled compliance review')
    last_reviewed_date = models.DateField(null=True, blank=True)
    last_reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='legal_requirements_last_reviewed',
    )

    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_legal_requirements',
    )
    is_deleted = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['requirement_type', 'title']

    def __str__(self):
        return f"{self.reference_number} — {self.title}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self._generate_reference()
        super().save(*args, **kwargs)

    def _generate_reference(self) -> str:
        year = timezone.now().year
        prefix = f"LEG-{year}-"
        last = (
            LegalRequirement.objects
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
    def is_overdue_review(self) -> bool:
        if self.review_date and self.compliance_status != ComplianceStatus.NOT_APPLICABLE:
            return self.review_date < timezone.now().date()
        return False


class LegalComplianceReview(models.Model):
    """Audit trail of every compliance assessment performed on a requirement."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requirement = models.ForeignKey(
        LegalRequirement,
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='legal_reviews_conducted',
    )
    review_date = models.DateField()
    compliance_status = models.CharField(max_length=25, choices=ComplianceStatus.choices)
    findings = models.TextField(blank=True, default='')
    evidence = models.TextField(blank=True, default='')
    next_review_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-review_date', '-created_at']

    def __str__(self):
        return f"{self.requirement.reference_number} review — {self.review_date}"
