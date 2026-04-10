import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

from .constants import AssessmentStatus, HazardCategory, RiskLevel, compute_risk_level


class HazardAssessment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='hazard_assessments',
    )
    reference_number = models.CharField(max_length=20, unique=True, blank=True, db_index=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    work_area = models.CharField(max_length=255, blank=True)
    department = models.ForeignKey(
        'core.Department',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='hazard_assessments',
    )

    assessed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='conducted_assessments',
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviewed_assessments',
    )

    assessment_date = models.DateField()
    next_review_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=AssessmentStatus.choices,
        default=AssessmentStatus.DRAFT,
        db_index=True,
    )

    is_deleted = models.BooleanField(default=False, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_assessments',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'risk_assessments_assessment'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference_number} — {self.title}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self._generate_reference_number()
        super().save(*args, **kwargs)

    def _generate_reference_number(self) -> str:
        year = timezone.now().year
        count = HazardAssessment.objects.filter(
            organization=self.organization,
            created_at__year=year,
        ).count()
        return f"HIRA-{year}-{str(count + 1).zfill(4)}"

    @property
    def hazard_count(self) -> int:
        return self.hazards.count()

    @property
    def critical_hazard_count(self) -> int:
        return self.hazards.filter(risk_level_before=RiskLevel.CRITICAL).count()

    @property
    def high_hazard_count(self) -> int:
        return self.hazards.filter(risk_level_before=RiskLevel.HIGH).count()


class Hazard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(
        HazardAssessment,
        on_delete=models.CASCADE,
        related_name='hazards',
    )

    hazard_description = models.TextField()
    hazard_category = models.CharField(
        max_length=20,
        choices=HazardCategory.choices,
        default=HazardCategory.PHYSICAL,
    )
    who_is_at_risk = models.CharField(max_length=255, blank=True)
    existing_controls = models.TextField(blank=True)

    # Initial risk (before additional controls)
    likelihood_before = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    consequence_before = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    risk_rating_before = models.PositiveSmallIntegerField(editable=False, default=0)
    risk_level_before = models.CharField(
        max_length=10, choices=RiskLevel.choices, editable=False, default=RiskLevel.LOW
    )

    # Additional controls and residual risk
    additional_controls = models.TextField(blank=True)
    responsible_person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='responsible_hazards',
    )
    target_date = models.DateField(null=True, blank=True)

    likelihood_after = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    consequence_after = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    risk_rating_after = models.PositiveSmallIntegerField(null=True, blank=True, editable=False)
    risk_level_after = models.CharField(
        max_length=10, choices=RiskLevel.choices, blank=True, editable=False
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'risk_assessments_hazard'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.hazard_category}: {self.hazard_description[:60]}"

    def save(self, *args, **kwargs):
        self.risk_rating_before = self.likelihood_before * self.consequence_before
        self.risk_level_before = compute_risk_level(self.risk_rating_before)
        if self.likelihood_after and self.consequence_after:
            self.risk_rating_after = self.likelihood_after * self.consequence_after
            self.risk_level_after = compute_risk_level(self.risk_rating_after)
        else:
            self.risk_rating_after = None
            self.risk_level_after = ''
        super().save(*args, **kwargs)
