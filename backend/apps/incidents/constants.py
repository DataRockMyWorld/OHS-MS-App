from django.db import models


class IncidentType(models.TextChoices):
    NEAR_MISS = 'near_miss', 'Near Miss'
    INJURY = 'injury', 'Injury'
    FIRST_AID = 'first_aid', 'First Aid Case'
    MEDICAL_TREATMENT = 'medical_treatment', 'Medical Treatment Case'
    LOST_TIME_INJURY = 'lost_time_injury', 'Lost Time Injury'
    FATALITY = 'fatality', 'Fatality'
    PROPERTY_DAMAGE = 'property_damage', 'Property Damage'
    ENVIRONMENTAL_SPILL = 'environmental_spill', 'Environmental Spill'
    UNSAFE_ACT = 'unsafe_act', 'Unsafe Act'
    UNSAFE_CONDITION = 'unsafe_condition', 'Unsafe Condition'
    FIRE = 'fire', 'Fire'
    VEHICLE_INCIDENT = 'vehicle_incident', 'Vehicle Incident'
    OTHER = 'other', 'Other'


class IncidentSeverity(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'
    CRITICAL = 'critical', 'Critical'


class IncidentStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    REPORTED = 'reported', 'Reported'
    UNDER_REVIEW = 'under_review', 'Under Review'
    INVESTIGATION_ONGOING = 'investigation_ongoing', 'Investigation Ongoing'
    ACTIONS_IMPLEMENTED = 'actions_implemented', 'Actions Implemented'
    CLOSED = 'closed', 'Closed'
    REOPENED = 'reopened', 'Reopened'


# Valid status transitions: { current_status: [allowed_next_statuses] }
VALID_STATUS_TRANSITIONS: dict[str, list[str]] = {
    IncidentStatus.DRAFT: [
        IncidentStatus.REPORTED,
    ],
    IncidentStatus.REPORTED: [
        IncidentStatus.UNDER_REVIEW,
    ],
    IncidentStatus.UNDER_REVIEW: [
        IncidentStatus.INVESTIGATION_ONGOING,
        IncidentStatus.ACTIONS_IMPLEMENTED,
    ],
    IncidentStatus.INVESTIGATION_ONGOING: [
        IncidentStatus.ACTIONS_IMPLEMENTED,
        IncidentStatus.UNDER_REVIEW,
    ],
    IncidentStatus.ACTIONS_IMPLEMENTED: [
        IncidentStatus.CLOSED,
    ],
    IncidentStatus.CLOSED: [
        IncidentStatus.REOPENED,
    ],
    IncidentStatus.REOPENED: [
        IncidentStatus.UNDER_REVIEW,
    ],
}

# Roles permitted to trigger each target status transition
# Import happens at runtime to avoid circular imports — use string role values
TRANSITION_PERMITTED_ROLES: dict[str, list[str]] = {
    IncidentStatus.REPORTED: [
        'employee', 'supervisor', 'hse_manager', 'org_admin', 'super_admin',
    ],
    IncidentStatus.UNDER_REVIEW: [
        'hse_manager', 'org_admin', 'super_admin',
    ],
    IncidentStatus.INVESTIGATION_ONGOING: [
        'hse_manager', 'org_admin', 'super_admin',
    ],
    IncidentStatus.ACTIONS_IMPLEMENTED: [
        'hse_manager', 'org_admin', 'super_admin',
    ],
    IncidentStatus.CLOSED: [
        'hse_manager', 'org_admin', 'super_admin',
    ],
    IncidentStatus.REOPENED: [
        'hse_manager', 'org_admin', 'super_admin',
    ],
}

ALLOWED_ATTACHMENT_MIME_TYPES = {
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'video/mp4',
}

MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB
