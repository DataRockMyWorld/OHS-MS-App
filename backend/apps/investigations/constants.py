from django.db import models


class InvestigationStatus(models.TextChoices):
    INITIATED             = 'initiated',             'Initiated'
    IN_PROGRESS           = 'in_progress',           'In Progress'
    FINDINGS_RECORDED     = 'findings_recorded',     'Findings Recorded'
    RECOMMENDATIONS_ISSUED = 'recommendations_issued', 'Recommendations Issued'
    CLOSED                = 'closed',                'Closed'


class RCAMethod(models.TextChoices):
    FIVE_WHYS   = 'five_whys',   '5 Whys'
    FISHBONE    = 'fishbone',    'Fishbone (Ishikawa)'
    FAULT_TREE  = 'fault_tree',  'Fault Tree Analysis'
    BOW_TIE     = 'bow_tie',     'Bow Tie Analysis'
    ICAM        = 'icam',        'ICAM'
    OTHER       = 'other',       'Other'


class RootCauseCategory(models.TextChoices):
    HUMAN_FACTORS     = 'human_factors',     'Human Factors'
    EQUIPMENT_FAILURE = 'equipment_failure', 'Equipment / Plant Failure'
    ENVIRONMENTAL     = 'environmental',     'Environmental Conditions'
    MANAGEMENT_SYSTEM = 'management_system', 'Management System Deficiency'
    PROCEDURE         = 'procedure',         'Procedure / Process Deficiency'
    TRAINING          = 'training',          'Training / Competency Deficiency'
    COMMUNICATION     = 'communication',     'Communication Failure'
    DESIGN            = 'design',            'Design Deficiency'
    EXTERNAL          = 'external',          'External / Uncontrollable'
    OTHER             = 'other',             'Other'


# Valid status transitions: { current_status: [allowed_next_statuses] }
VALID_STATUS_TRANSITIONS: dict[str, list[str]] = {
    InvestigationStatus.INITIATED: [
        InvestigationStatus.IN_PROGRESS,
    ],
    InvestigationStatus.IN_PROGRESS: [
        InvestigationStatus.FINDINGS_RECORDED,
    ],
    InvestigationStatus.FINDINGS_RECORDED: [
        InvestigationStatus.RECOMMENDATIONS_ISSUED,
        InvestigationStatus.IN_PROGRESS,  # Allow going back to add more findings
    ],
    InvestigationStatus.RECOMMENDATIONS_ISSUED: [
        InvestigationStatus.CLOSED,
    ],
    InvestigationStatus.CLOSED: [
        InvestigationStatus.INITIATED,   # Reopen
    ],
}

# Roles permitted to trigger each target status transition
TRANSITION_PERMITTED_ROLES: dict[str, list[str]] = {
    InvestigationStatus.IN_PROGRESS: [
        'supervisor', 'hse_manager', 'org_admin', 'super_admin',
    ],
    InvestigationStatus.FINDINGS_RECORDED: [
        'supervisor', 'hse_manager', 'org_admin', 'super_admin',
    ],
    InvestigationStatus.RECOMMENDATIONS_ISSUED: [
        'hse_manager', 'org_admin', 'super_admin',
    ],
    InvestigationStatus.CLOSED: [
        'hse_manager', 'org_admin', 'super_admin',
    ],
    InvestigationStatus.INITIATED: [
        'hse_manager', 'org_admin', 'super_admin',  # Reopen
    ],
}
