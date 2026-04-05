from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import CorrectiveAction, CorrectiveActionStatusHistory, EffectivenessReview
from .constants import CAStatus, VALID_STATUS_TRANSITIONS, EffectivenessRating

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'job_title', 'role']
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class InvestigationStubSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    reference_number = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)


class IncidentStubSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    reference_number = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)


class EffectivenessReviewSerializer(serializers.ModelSerializer):
    reviewer = UserMinimalSerializer(read_only=True)
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)

    class Meta:
        model = EffectivenessReview
        fields = [
            'id', 'reviewer', 'review_date',
            'rating', 'rating_display',
            'evidence_description', 'notes',
            'next_review_date', 'created_at',
        ]
        read_only_fields = ['id', 'reviewer', 'created_at']


class EffectivenessReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EffectivenessReview
        fields = ['review_date', 'rating', 'evidence_description', 'notes', 'next_review_date']

    def validate(self, data):
        rating = data.get('rating')
        next_review_date = data.get('next_review_date')
        if rating in (EffectivenessRating.PARTIALLY_EFFECTIVE, EffectivenessRating.NOT_EFFECTIVE):
            if not next_review_date:
                raise serializers.ValidationError(
                    'next_review_date is required when rating is Partially Effective or Not Effective.'
                )
        return data


class CAStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = UserMinimalSerializer(read_only=True)
    from_status_display = serializers.SerializerMethodField()
    to_status_display = serializers.SerializerMethodField()

    class Meta:
        model = CorrectiveActionStatusHistory
        fields = [
            'id', 'from_status', 'from_status_display',
            'to_status', 'to_status_display',
            'changed_by', 'comment', 'created_at',
        ]
        read_only_fields = fields

    def get_from_status_display(self, obj):
        return dict(CAStatus.choices).get(obj.from_status, obj.from_status)

    def get_to_status_display(self, obj):
        return dict(CAStatus.choices).get(obj.to_status, obj.to_status)


class CAListSerializer(serializers.ModelSerializer):
    assigned_to = UserMinimalSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    source_type_display = serializers.CharField(source='get_source_type_display', read_only=True)
    allowed_transitions = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    effectiveness_review_count = serializers.SerializerMethodField()
    source_investigation_reference = serializers.CharField(
        source='source_investigation.reference_number', read_only=True, default=None,
    )
    source_incident_reference = serializers.CharField(
        source='source_incident.reference_number', read_only=True, default=None,
    )

    class Meta:
        model = CorrectiveAction
        fields = [
            'id', 'reference_number', 'title',
            'action_type', 'action_type_display',
            'priority', 'priority_display',
            'status', 'status_display',
            'source_type', 'source_type_display',
            'source_investigation_reference', 'source_incident_reference',
            'assigned_to',
            'target_date', 'implementation_date',
            'allowed_transitions', 'is_overdue', 'effectiveness_review_count',
            'created_at',
        ]
        read_only_fields = fields

    def get_allowed_transitions(self, obj):
        return VALID_STATUS_TRANSITIONS.get(obj.status, [])

    def get_is_overdue(self, obj):
        return obj.is_overdue

    def get_effectiveness_review_count(self, obj):
        if hasattr(obj, '_effectiveness_review_count'):
            return obj._effectiveness_review_count
        return obj.effectiveness_reviews.count()


class CADetailSerializer(serializers.ModelSerializer):
    assigned_to = UserMinimalSerializer(read_only=True)
    created_by = UserMinimalSerializer(read_only=True)
    closed_by = UserMinimalSerializer(read_only=True)
    source_investigation = InvestigationStubSerializer(read_only=True)
    source_incident = IncidentStubSerializer(read_only=True)
    effectiveness_reviews = EffectivenessReviewSerializer(many=True, read_only=True)
    status_history = CAStatusHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    source_type_display = serializers.CharField(source='get_source_type_display', read_only=True)
    allowed_transitions = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = CorrectiveAction
        fields = [
            'id', 'reference_number', 'title', 'description',
            'action_type', 'action_type_display',
            'priority', 'priority_display',
            'status', 'status_display',
            'source_type', 'source_type_display',
            'source_investigation', 'source_incident',
            'assigned_to', 'created_by',
            'planned_action', 'implementation_notes', 'implementation_evidence',
            'target_date', 'implementation_date',
            'closed_by', 'closed_at',
            'effectiveness_reviews', 'status_history',
            'allowed_transitions', 'is_overdue',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reference_number', 'created_by',
            'closed_by', 'closed_at',
            'created_at', 'updated_at',
        ]

    def get_allowed_transitions(self, obj):
        return VALID_STATUS_TRANSITIONS.get(obj.status, [])

    def get_is_overdue(self, obj):
        return obj.is_overdue


class CACreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorrectiveAction
        fields = [
            'title', 'description', 'action_type', 'priority',
            'source_type', 'source_investigation', 'source_incident',
            'assigned_to', 'planned_action', 'target_date',
        ]

    def validate_source_investigation(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError(
                'Source investigation does not belong to your organization.'
            )
        return value

    def validate_source_incident(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError(
                'Source incident does not belong to your organization.'
            )
        return value

    def validate_assigned_to(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError(
                'Assigned user must belong to your organization.'
            )
        return value


class CAUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorrectiveAction
        fields = [
            'title', 'description', 'action_type', 'priority',
            'assigned_to', 'planned_action',
            'implementation_notes', 'implementation_evidence',
            'target_date', 'implementation_date',
        ]

    def validate(self, data):
        if self.instance and self.instance.status == CAStatus.CLOSED:
            raise serializers.ValidationError(
                'A closed corrective action cannot be edited. Reopen it first.'
            )
        return data

    def validate_assigned_to(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError(
                'Assigned user must belong to your organization.'
            )
        return value


class CATransitionSerializer(serializers.Serializer):
    new_status = serializers.ChoiceField(choices=CAStatus.choices)
    comment = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_new_status(self, value):
        ca = self.context.get('ca')
        if ca:
            allowed = VALID_STATUS_TRANSITIONS.get(ca.status, [])
            if value not in allowed:
                raise serializers.ValidationError(
                    f"Cannot transition from '{ca.status}' to '{value}'. "
                    f"Allowed transitions: {allowed}"
                )
        return value


class CAStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    this_month = serializers.IntegerField()
    open_count = serializers.IntegerField()
    pending_review_count = serializers.IntegerField()
    closed_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
