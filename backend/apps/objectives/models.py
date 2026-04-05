import uuid
from django.db import models
from apps.accounts.models import User
from apps.core.models import Organization


class Objective(models.Model):
    class Scope(models.TextChoices):
        ORGANIZATIONAL = 'organizational', 'Organizational'
        INDIVIDUAL = 'individual', 'Individual'

    class Direction(models.TextChoices):
        INCREASE = 'increase', 'Increase'
        DECREASE = 'decrease', 'Decrease'
        MAINTAIN = 'maintain', 'Maintain'

    class Frequency(models.TextChoices):
        MONTHLY = 'monthly', 'Monthly'
        QUARTERLY = 'quarterly', 'Quarterly'
        BI_ANNUALLY = 'bi_annually', 'Bi-Annually'

    class Status(models.TextChoices):
        ON_TRACK = 'on_track', 'On Track'
        AT_RISK = 'at_risk', 'At Risk'
        BEHIND = 'behind', 'Behind'
        ACHIEVED = 'achieved', 'Achieved'
        CLOSED = 'closed', 'Closed'

    class Category(models.TextChoices):
        LAGGING = 'lagging', 'Lagging'
        LEADING = 'leading', 'Leading'

    class LinkedMetric(models.TextChoices):
        MANUAL = 'manual', 'Manual Entry'
        NEAR_MISS_COUNT = 'near_miss_count', 'Near Miss Count'
        TOTAL_INCIDENT_COUNT = 'total_incident_count', 'Total Incident Count'
        INJURY_COUNT = 'injury_count', 'Injury Count'
        CRITICAL_INCIDENT_COUNT = 'critical_incident_count', 'Critical Incident Count'
        OPEN_INCIDENT_COUNT = 'open_incident_count', 'Open Incident Count'
        OVERDUE_CA_COUNT = 'overdue_ca_count', 'Overdue Corrective Actions'
        CA_CLOSURE_RATE = 'ca_closure_rate', 'CA On-Time Closure Rate (%)'
        OPEN_INVESTIGATION_COUNT = 'open_investigation_count', 'Open Investigation Count'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='objectives')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    scope = models.CharField(max_length=20, choices=Scope.choices, default=Scope.ORGANIZATIONAL)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.LAGGING)
    unit = models.CharField(max_length=50, help_text="e.g. count, %, rate, days")
    direction = models.CharField(max_length=20, choices=Direction.choices, default=Direction.DECREASE)
    measurement_frequency = models.CharField(max_length=20, choices=Frequency.choices, default=Frequency.MONTHLY)
    linked_metric = models.CharField(max_length=50, choices=LinkedMetric.choices, default=LinkedMetric.MANUAL)
    baseline_value = models.DecimalField(max_digits=12, decimal_places=2)
    target_value = models.DecimalField(max_digits=12, decimal_places=2)
    current_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    weight = models.PositiveIntegerField(default=1, help_text="Relative weight for scoring")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ON_TRACK)
    start_date = models.DateField()
    target_date = models.DateField()
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_objectives')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_objectives')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class KPIMeasurement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    objective = models.ForeignKey(Objective, on_delete=models.CASCADE, related_name='measurements')
    value = models.DecimalField(max_digits=12, decimal_places=2)
    measured_at = models.DateField(help_text="The period this measurement covers")
    notes = models.TextField(blank=True)
    is_auto_computed = models.BooleanField(default=False)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='recorded_measurements')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['measured_at']

    def __str__(self):
        return f"{self.objective.title} — {self.measured_at}: {self.value}"
