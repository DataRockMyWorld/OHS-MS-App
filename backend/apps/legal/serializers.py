from rest_framework import serializers
from .models import LegalRequirement, LegalComplianceReview


class LegalComplianceReviewSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    compliance_status_display = serializers.CharField(source='get_compliance_status_display', read_only=True)

    class Meta:
        model = LegalComplianceReview
        fields = [
            'id', 'review_date', 'compliance_status', 'compliance_status_display',
            'findings', 'evidence', 'next_review_date',
            'reviewed_by_name', 'created_at',
        ]
        read_only_fields = ['id', 'reviewed_by_name', 'compliance_status_display', 'created_at']


class LegalRequirementListSerializer(serializers.ModelSerializer):
    requirement_type_display = serializers.CharField(source='get_requirement_type_display', read_only=True)
    jurisdiction_display = serializers.CharField(source='get_jurisdiction_display', read_only=True)
    compliance_status_display = serializers.CharField(source='get_compliance_status_display', read_only=True)
    responsible_person_name = serializers.CharField(
        source='responsible_person.get_full_name', read_only=True, default=None
    )
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    is_overdue_review = serializers.BooleanField(read_only=True)

    class Meta:
        model = LegalRequirement
        fields = [
            'id', 'reference_number', 'title',
            'requirement_type', 'requirement_type_display',
            'jurisdiction', 'jurisdiction_display',
            'compliance_status', 'compliance_status_display',
            'department_name', 'responsible_person_name',
            'effective_date', 'review_date', 'last_reviewed_date',
            'is_overdue_review',
        ]


class LegalRequirementDetailSerializer(serializers.ModelSerializer):
    requirement_type_display = serializers.CharField(source='get_requirement_type_display', read_only=True)
    jurisdiction_display = serializers.CharField(source='get_jurisdiction_display', read_only=True)
    compliance_status_display = serializers.CharField(source='get_compliance_status_display', read_only=True)
    responsible_person_detail = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    reviews = LegalComplianceReviewSerializer(many=True, read_only=True)
    is_overdue_review = serializers.BooleanField(read_only=True)
    last_reviewed_by_name = serializers.CharField(
        source='last_reviewed_by.get_full_name', read_only=True, default=None
    )

    class Meta:
        model = LegalRequirement
        fields = [
            'id', 'reference_number', 'title',
            'requirement_type', 'requirement_type_display',
            'jurisdiction', 'jurisdiction_display',
            'description', 'applicable_clauses', 'source_url',
            'department', 'department_name',
            'responsible_person', 'responsible_person_detail',
            'compliance_status', 'compliance_status_display',
            'compliance_notes', 'compliance_evidence',
            'effective_date', 'review_date',
            'last_reviewed_date', 'last_reviewed_by_name',
            'is_overdue_review', 'reviews',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'reference_number', 'created_at', 'updated_at']

    def get_responsible_person_detail(self, obj):
        if not obj.responsible_person:
            return None
        u = obj.responsible_person
        return {'id': str(u.id), 'full_name': u.get_full_name(), 'email': u.email}


class LegalRequirementWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalRequirement
        fields = [
            'title', 'requirement_type', 'jurisdiction',
            'description', 'applicable_clauses', 'source_url',
            'department', 'responsible_person',
            'compliance_status', 'compliance_notes', 'compliance_evidence',
            'effective_date', 'review_date',
        ]
