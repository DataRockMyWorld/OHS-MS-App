from django.db import models


class RequirementType(models.TextChoices):
    LEGISLATION     = 'legislation',      'Legislation / Act'
    REGULATION      = 'regulation',       'Regulation / Statutory Instrument'
    STANDARD        = 'standard',         'Standard (e.g. ISO, AS/NZS)'
    CODE_OF_PRACTICE = 'code_of_practice', 'Code of Practice'
    PERMIT          = 'permit',           'Permit / Licence / Approval'
    AGREEMENT       = 'agreement',        'Contractual / Agreement'
    OTHER           = 'other',            'Other'


class Jurisdiction(models.TextChoices):
    INTERNATIONAL = 'international', 'International'
    NATIONAL      = 'national',      'National / Federal'
    STATE         = 'state',         'State / Provincial'
    LOCAL         = 'local',         'Local / Municipal'
    INDUSTRY      = 'industry',      'Industry / Sector'


class ComplianceStatus(models.TextChoices):
    COMPLIANT           = 'compliant',           'Compliant'
    PARTIALLY_COMPLIANT = 'partially_compliant', 'Partially Compliant'
    NON_COMPLIANT       = 'non_compliant',        'Non-Compliant'
    NOT_ASSESSED        = 'not_assessed',         'Not Yet Assessed'
    NOT_APPLICABLE      = 'not_applicable',       'Not Applicable'
