from django.db import models


class AuditType(models.TextChoices):
    INTERNAL       = 'internal',       'Internal Audit'
    EXTERNAL       = 'external',       'External Audit'
    SURVEILLANCE   = 'surveillance',   'Surveillance Audit'
    CERTIFICATION  = 'certification',  'Certification Audit'
    INSPECTION     = 'inspection',     'Inspection'
    MANAGEMENT_REVIEW = 'management_review', 'Management Review'


class AuditStatus(models.TextChoices):
    PLANNED    = 'planned',    'Planned'
    IN_PROGRESS = 'in_progress', 'In Progress'
    COMPLETED  = 'completed',  'Completed'
    CANCELLED  = 'cancelled',  'Cancelled'


class FindingSeverity(models.TextChoices):
    OBSERVATION    = 'observation',    'Observation'
    MINOR_NC       = 'minor_nc',       'Minor Non-Conformance'
    MAJOR_NC       = 'major_nc',       'Major Non-Conformance'
    OPPORTUNITY    = 'opportunity',    'Opportunity for Improvement'


class FindingStatus(models.TextChoices):
    OPEN    = 'open',    'Open'
    RAISED  = 'raised',  'CA Raised'
    CLOSED  = 'closed',  'Closed'
