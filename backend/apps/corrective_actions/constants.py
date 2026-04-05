from django.db import models


class CAStatus(models.TextChoices):
    OPEN         = 'open',         'Open'
    IN_PROGRESS  = 'in_progress',  'In Progress'
    IMPLEMENTED  = 'implemented',  'Implemented — Awaiting Review'
    CLOSED       = 'closed',       'Closed'
    REOPENED     = 'reopened',     'Reopened'


class CAPriority(models.TextChoices):
    LOW      = 'low',      'Low'
    MEDIUM   = 'medium',   'Medium'
    HIGH     = 'high',     'High'
    CRITICAL = 'critical', 'Critical'


class CAType(models.TextChoices):
    CORRECTIVE  = 'corrective',  'Corrective'
    PREVENTIVE  = 'preventive',  'Preventive'
    IMPROVEMENT = 'improvement', 'Improvement Opportunity'


class CASource(models.TextChoices):
    INVESTIGATION     = 'investigation',      'Investigation'
    INCIDENT          = 'incident',           'Incident'
    AUDIT             = 'audit',              'Audit'
    RISK_ASSESSMENT   = 'risk_assessment',    'Risk Assessment'
    MANAGEMENT_REVIEW = 'management_review',  'Management Review'
    OTHER             = 'other',              'Other'


class EffectivenessRating(models.TextChoices):
    FULLY_EFFECTIVE    = 'fully_effective',    'Fully Effective'
    PARTIALLY_EFFECTIVE = 'partially_effective', 'Partially Effective'
    NOT_EFFECTIVE      = 'not_effective',      'Not Effective'


# Valid status transitions: { current_status: [allowed_next_statuses] }
VALID_STATUS_TRANSITIONS: dict[str, list[str]] = {
    CAStatus.OPEN:        [CAStatus.IN_PROGRESS],
    CAStatus.IN_PROGRESS: [CAStatus.IMPLEMENTED],
    CAStatus.IMPLEMENTED: [CAStatus.CLOSED, CAStatus.IN_PROGRESS],
    CAStatus.CLOSED:      [CAStatus.REOPENED],
    CAStatus.REOPENED:    [CAStatus.IN_PROGRESS],
}

# Roles permitted to trigger each target status
TRANSITION_PERMITTED_ROLES: dict[str, list[str]] = {
    CAStatus.IN_PROGRESS: ['employee', 'supervisor', 'hse_manager', 'org_admin', 'super_admin'],
    CAStatus.IMPLEMENTED: ['employee', 'supervisor', 'hse_manager', 'org_admin', 'super_admin'],
    CAStatus.CLOSED:      ['hse_manager', 'org_admin', 'super_admin'],
    CAStatus.REOPENED:    ['hse_manager', 'org_admin', 'super_admin'],
}
