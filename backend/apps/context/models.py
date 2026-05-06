import uuid
from django.db import models
from apps.accounts.models import User
from apps.core.models import Organization


class ManagementSystemScope(models.Model):
    """
    ISO 45001 Clause 4.3 — Determining the scope of the OH&S management system.
    One record per organization (OneToOneField).
    """
    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name='ohsms_scope',
    )
    scope_statement = models.TextField(
        help_text="Formal statement of what the OH&S management system covers.",
    )
    boundaries_and_applicability = models.TextField(
        blank=True,
        help_text="Physical locations, organizational units, activities included/excluded.",
    )
    activities_products_services = models.TextField(
        blank=True,
        help_text="Main activities, products, and services within scope.",
    )
    exclusions = models.TextField(
        blank=True,
        help_text="Anything explicitly excluded from the scope, with justification.",
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scope_updates',
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Management System Scope'

    def __str__(self):
        return f"Scope — {self.organization.name}"


class InterestedParty(models.Model):
    class PartyType(models.TextChoices):
        WORKER = 'worker', 'Worker'
        CONTRACTOR = 'contractor', 'Contractor'
        REGULATOR = 'regulator', 'Regulator'
        SUPPLIER = 'supplier', 'Supplier'
        CUSTOMER = 'customer', 'Customer'
        COMMUNITY = 'community', 'Community'
        INVESTOR = 'investor', 'Investor'
        OTHER = 'other', 'Other'

    class PartyCategory(models.TextChoices):
        INTERNAL = 'internal', 'Internal'
        EXTERNAL = 'external', 'External'

    class ReviewFrequency(models.TextChoices):
        ANNUALLY = 'annually', 'Annually'
        SEMI_ANNUALLY = 'semi_annually', 'Semi-Annually'
        QUARTERLY = 'quarterly', 'Quarterly'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='interested_parties')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=PartyCategory.choices, default=PartyCategory.INTERNAL)
    party_type = models.CharField(max_length=20, choices=PartyType.choices, default=PartyType.OTHER)
    needs_and_expectations = models.TextField()
    is_compliance_obligation = models.BooleanField(default=False)
    review_frequency = models.CharField(
        max_length=20, choices=ReviewFrequency.choices, default=ReviewFrequency.ANNUALLY
    )
    last_reviewed_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class ContextIssue(models.Model):
    class IssueType(models.TextChoices):
        INTERNAL = 'internal', 'Internal'
        EXTERNAL = 'external', 'External'

    class AnalysisTag(models.TextChoices):
        SWOT_STRENGTH = 'swot_strength', 'SWOT — Strength'
        SWOT_WEAKNESS = 'swot_weakness', 'SWOT — Weakness'
        SWOT_OPPORTUNITY = 'swot_opportunity', 'SWOT — Opportunity'
        SWOT_THREAT = 'swot_threat', 'SWOT — Threat'
        PESTLE_POLITICAL = 'pestle_political', 'PESTLE — Political'
        PESTLE_ECONOMIC = 'pestle_economic', 'PESTLE — Economic'
        PESTLE_SOCIAL = 'pestle_social', 'PESTLE — Social'
        PESTLE_TECHNOLOGICAL = 'pestle_technological', 'PESTLE — Technological'
        PESTLE_LEGAL = 'pestle_legal', 'PESTLE — Legal'
        PESTLE_ENVIRONMENTAL = 'pestle_environmental', 'PESTLE — Environmental'
        OTHER = 'other', 'Other'

    class Classification(models.TextChoices):
        RISK = 'risk', 'Risk'
        OPPORTUNITY = 'opportunity', 'Opportunity'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        MONITORED = 'monitored', 'Monitored'
        ADDRESSED = 'addressed', 'Addressed'
        CLOSED = 'closed', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='context_issues')
    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=IssueType.choices)
    analysis_tag = models.CharField(max_length=30, choices=AnalysisTag.choices, default=AnalysisTag.OTHER)
    classification = models.CharField(max_length=20, choices=Classification.choices)
    interested_party = models.ForeignKey(
        InterestedParty,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='context_issues',
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    identified_date = models.DateField()
    identified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='identified_issues',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class RiskOrOpportunity(models.Model):
    class ROType(models.TextChoices):
        RISK = 'risk', 'Risk'
        OPPORTUNITY = 'opportunity', 'Opportunity'

    class SeverityLevel(models.TextChoices):
        HIGH = 'high', 'High'
        MEDIUM = 'medium', 'Medium'
        LOW = 'low', 'Low'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        BEING_ADDRESSED = 'being_addressed', 'Being Addressed'
        CLOSED = 'closed', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='risks_and_opportunities')
    type = models.CharField(max_length=20, choices=ROType.choices)
    title = models.CharField(max_length=255)
    description = models.TextField()
    source_issue = models.ForeignKey(
        ContextIssue,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='risks_and_opportunities',
    )
    severity_level = models.CharField(max_length=20, choices=SeverityLevel.choices)
    controls = models.TextField(blank=True)
    potential_benefit = models.TextField(blank=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_risks_opportunities',
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Risks and Opportunities'

    def __str__(self):
        return self.title
