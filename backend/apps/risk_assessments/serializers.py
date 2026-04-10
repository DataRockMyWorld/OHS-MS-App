from rest_framework import serializers
from apps.accounts.serializers import UserMinimalSerializer
from .models import HazardAssessment, Hazard


class HazardSerializer(serializers.ModelSerializer):
    responsible_person_detail = UserMinimalSerializer(source='responsible_person', read_only=True)
    hazard_category_display = serializers.CharField(source='get_hazard_category_display', read_only=True)
    risk_level_before_display = serializers.CharField(source='get_risk_level_before_display', read_only=True)
    risk_level_after_display = serializers.SerializerMethodField()

    class Meta:
        model = Hazard
        fields = [
            'id',
            'hazard_description', 'hazard_category', 'hazard_category_display',
            'who_is_at_risk', 'existing_controls',
            'likelihood_before', 'consequence_before',
            'risk_rating_before', 'risk_level_before', 'risk_level_before_display',
            'additional_controls', 'responsible_person', 'responsible_person_detail',
            'target_date',
            'likelihood_after', 'consequence_after',
            'risk_rating_after', 'risk_level_after', 'risk_level_after_display',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'risk_rating_before', 'risk_level_before', 'risk_level_before_display',
            'risk_rating_after', 'risk_level_after', 'risk_level_after_display',
            'responsible_person_detail', 'hazard_category_display', 'created_at', 'updated_at',
        ]

    def get_risk_level_after_display(self, obj):
        if obj.risk_level_after:
            return obj.get_risk_level_after_display()
        return None


class HazardAssessmentListSerializer(serializers.ModelSerializer):
    assessed_by_detail = UserMinimalSerializer(source='assessed_by', read_only=True)
    reviewed_by_detail = UserMinimalSerializer(source='reviewed_by', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    hazard_count = serializers.IntegerField(read_only=True)
    critical_hazard_count = serializers.IntegerField(read_only=True)
    high_hazard_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = HazardAssessment
        fields = [
            'id', 'reference_number', 'title', 'work_area', 'department_name',
            'status', 'status_display',
            'assessment_date', 'next_review_date',
            'assessed_by_detail', 'reviewed_by_detail',
            'hazard_count', 'critical_hazard_count', 'high_hazard_count',
            'created_at',
        ]
        read_only_fields = fields


class HazardAssessmentDetailSerializer(serializers.ModelSerializer):
    assessed_by_detail = UserMinimalSerializer(source='assessed_by', read_only=True)
    reviewed_by_detail = UserMinimalSerializer(source='reviewed_by', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    hazards = HazardSerializer(many=True, read_only=True)

    class Meta:
        model = HazardAssessment
        fields = [
            'id', 'reference_number', 'title', 'description', 'work_area',
            'department', 'department_name', 'status', 'status_display',
            'assessment_date', 'next_review_date',
            'assessed_by', 'assessed_by_detail',
            'reviewed_by', 'reviewed_by_detail',
            'hazards',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reference_number', 'status_display',
            'assessed_by_detail', 'reviewed_by_detail', 'department_name',
            'hazards', 'created_at', 'updated_at',
        ]


class HazardAssessmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HazardAssessment
        fields = [
            'title', 'description', 'work_area', 'department',
            'assessment_date', 'next_review_date',
            'assessed_by', 'reviewed_by',
        ]
