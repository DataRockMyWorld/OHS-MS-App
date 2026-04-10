import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class UserRole(models.TextChoices):
    SUPER_ADMIN = 'super_admin', 'Super Admin'
    ORG_ADMIN = 'org_admin', 'Organization Admin'
    HSE_MANAGER = 'hse_manager', 'HSE Manager'
    SUPERVISOR = 'supervisor', 'Supervisor'
    EMPLOYEE = 'employee', 'Employee'
    AUDITOR = 'auditor', 'Auditor'


class User(AbstractUser):
    """
    Custom user model. Email is the primary identifier for login.
    Organization FK is null only for Super Admins who span all tenants.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members',
    )
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
        db_index=True,
    )
    phone = models.CharField(max_length=20, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    department = models.ForeignKey(
        'core.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members',
    )
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'accounts_user'
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return self.get_full_name() or self.email

    @property
    def full_name(self):
        return self.get_full_name() or self.email

    def is_org_admin_or_above(self):
        return self.role in (
            UserRole.SUPER_ADMIN,
            UserRole.ORG_ADMIN,
        )

    def is_hse_manager_or_above(self):
        return self.role in (
            UserRole.SUPER_ADMIN,
            UserRole.ORG_ADMIN,
            UserRole.HSE_MANAGER,
        )

    def is_supervisor_or_above(self):
        return self.role in (
            UserRole.SUPER_ADMIN,
            UserRole.ORG_ADMIN,
            UserRole.HSE_MANAGER,
            UserRole.SUPERVISOR,
        )


# ── Notifications ──────────────────────────────────────────────────────────────

class NotificationType(models.TextChoices):
    INCIDENT_ASSIGNED = 'incident_assigned', 'Incident Assigned to You'
    CA_ASSIGNED = 'ca_assigned', 'Corrective Action Assigned to You'
    CA_OVERDUE = 'ca_overdue', 'Corrective Action Overdue'
    INVESTIGATION_ASSIGNED = 'investigation_assigned', 'Investigation Assigned to You'
    INVESTIGATION_OVERDUE = 'investigation_overdue', 'Investigation Overdue'
    GENERAL = 'general', 'General'


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications'
    )
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='notifications',
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL,
    )
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    link = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts_notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} → {self.user_id}"
