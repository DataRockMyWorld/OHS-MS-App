from rest_framework import serializers
from .models import ManagementSystemScope, InterestedParty, ContextIssue, RiskOrOpportunity
from .services import ContextService


class ManagementSystemScopeSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ManagementSystemScope
        fields = [
            'id',
            'scope_statement',
            'boundaries_and_applicability',
            'activities_products_services',
            'exclusions',
            'updated_by_name',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_by_name', 'updated_at']

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            return obj.updated_by.get_full_name() or obj.updated_by.email
        return None


class InterestedPartySerializer(serializers.ModelSerializer):
    class Meta:
        model = InterestedParty
        fields = [
            'id',
            'name',
            'category',
            'party_type',
            'needs_and_expectations',
            'is_compliance_obligation',
            'review_frequency',
            'last_reviewed_date',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContextIssueListSerializer(serializers.ModelSerializer):
    interested_party_name = serializers.SerializerMethodField()
    identified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ContextIssue
        fields = [
            'id',
            'title',
            'type',
            'analysis_tag',
            'classification',
            'status',
            'identified_date',
            'identified_by',
            'identified_by_name',
            'interested_party',
            'interested_party_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'identified_by_name', 'interested_party_name']

    def get_interested_party_name(self, obj):
        if obj.interested_party:
            return obj.interested_party.name
        return None

    def get_identified_by_name(self, obj):
        if obj.identified_by:
            return obj.identified_by.get_full_name() or obj.identified_by.email
        return None


class ContextIssueDetailSerializer(ContextIssueListSerializer):
    ro_count = serializers.SerializerMethodField()

    class Meta(ContextIssueListSerializer.Meta):
        fields = ContextIssueListSerializer.Meta.fields + ['description', 'ro_count', 'updated_at']
        read_only_fields = ContextIssueListSerializer.Meta.read_only_fields + ['ro_count', 'updated_at']

    def get_ro_count(self, obj):
        return obj.risks_and_opportunities.count()


class ContextIssueWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContextIssue
        fields = [
            'title',
            'description',
            'type',
            'analysis_tag',
            'classification',
            'interested_party',
            'status',
            'identified_date',
            'identified_by',
        ]

    def validate(self, attrs):
        analysis_tag = attrs.get('analysis_tag', 'other')
        explicit_classification = attrs.get('classification', 'risk')
        attrs['classification'] = ContextService.derive_classification(analysis_tag, explicit_classification)
        return attrs


class RiskOrOpportunityListSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    source_issue_title = serializers.SerializerMethodField()
    linked_objectives_count = serializers.SerializerMethodField()

    class Meta:
        model = RiskOrOpportunity
        fields = [
            'id',
            'type',
            'title',
            'severity_level',
            'status',
            'owner',
            'owner_name',
            'source_issue',
            'source_issue_title',
            'linked_objectives_count',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'owner_name', 'source_issue_title', 'linked_objectives_count']

    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name() or obj.owner.email
        return None

    def get_source_issue_title(self, obj):
        if obj.source_issue:
            return obj.source_issue.title
        return None

    def get_linked_objectives_count(self, obj):
        return obj.objectives.count()


class RiskOrOpportunityDetailSerializer(RiskOrOpportunityListSerializer):
    class Meta(RiskOrOpportunityListSerializer.Meta):
        fields = RiskOrOpportunityListSerializer.Meta.fields + [
            'description',
            'controls',
            'potential_benefit',
            'updated_at',
        ]
        read_only_fields = RiskOrOpportunityListSerializer.Meta.read_only_fields + ['updated_at']


class RiskOrOpportunityWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskOrOpportunity
        fields = [
            'type',
            'title',
            'description',
            'source_issue',
            'severity_level',
            'controls',
            'potential_benefit',
            'owner',
            'status',
        ]
