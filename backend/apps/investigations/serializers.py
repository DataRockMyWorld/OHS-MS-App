from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Investigation, RootCause, InvestigationTeamMember, InvestigationStatusHistory
from .constants import InvestigationStatus, VALID_STATUS_TRANSITIONS, TRANSITION_PERMITTED_ROLES

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'job_title', 'role']
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class IncidentStubSerializer(serializers.Serializer):
    """Lightweight incident representation to avoid circular imports."""
    id = serializers.UUIDField(read_only=True)
    reference_number = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    severity = serializers.CharField(read_only=True)
    date_of_incident = serializers.DateField(read_only=True)


class RootCauseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = RootCause
        fields = [
            'id', 'category', 'category_display',
            'description', 'why_analysis', 'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RootCauseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RootCause
        fields = ['category', 'description', 'why_analysis', 'order']

    def validate_why_analysis(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError('why_analysis must be a list of strings.')
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError('Each why_analysis entry must be a string.')
        return value


class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = InvestigationTeamMember
        fields = ['id', 'user', 'added_at']
        read_only_fields = fields


class InvestigationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = UserMinimalSerializer(read_only=True)
    from_status_display = serializers.SerializerMethodField()
    to_status_display = serializers.SerializerMethodField()

    class Meta:
        model = InvestigationStatusHistory
        fields = [
            'id', 'from_status', 'from_status_display',
            'to_status', 'to_status_display',
            'changed_by', 'comment', 'created_at',
        ]
        read_only_fields = fields

    def get_from_status_display(self, obj):
        return dict(InvestigationStatus.choices).get(obj.from_status, obj.from_status)

    def get_to_status_display(self, obj):
        return dict(InvestigationStatus.choices).get(obj.to_status, obj.to_status)


class InvestigationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    lead_investigator = UserMinimalSerializer(read_only=True)
    incident_reference = serializers.CharField(
        source='incident.reference_number', read_only=True, default=None,
    )
    incident_title = serializers.CharField(
        source='incident.title', read_only=True, default=None,
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    rca_method_display = serializers.CharField(source='get_rca_method_display', read_only=True)
    allowed_transitions = serializers.SerializerMethodField()
    root_cause_count = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Investigation
        fields = [
            'id', 'reference_number', 'title',
            'status', 'status_display',
            'rca_method', 'rca_method_display',
            'lead_investigator',
            'incident_reference', 'incident_title',
            'target_completion_date', 'actual_completion_date',
            'allowed_transitions', 'root_cause_count', 'is_overdue',
            'created_at',
        ]
        read_only_fields = fields

    def get_allowed_transitions(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        role = getattr(user, 'role', None) or 'employee'
        return [
            t for t in VALID_STATUS_TRANSITIONS.get(obj.status, [])
            if role in TRANSITION_PERMITTED_ROLES.get(t, [])
        ]

    def get_root_cause_count(self, obj):
        if hasattr(obj, '_root_cause_count'):
            return obj._root_cause_count
        return obj.root_causes.count()

    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.target_completion_date and obj.status not in (
            InvestigationStatus.CLOSED,
        ):
            return obj.target_completion_date < timezone.now().date()
        return False


class InvestigationDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views."""
    lead_investigator = UserMinimalSerializer(read_only=True)
    created_by = UserMinimalSerializer(read_only=True)
    closed_by = UserMinimalSerializer(read_only=True)
    incident = IncidentStubSerializer(read_only=True)
    root_causes = RootCauseSerializer(many=True, read_only=True)
    team_memberships = TeamMemberSerializer(many=True, read_only=True)
    status_history = InvestigationStatusHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    rca_method_display = serializers.CharField(source='get_rca_method_display', read_only=True)
    allowed_transitions = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Investigation
        fields = [
            'id', 'reference_number', 'title',
            'status', 'status_display',
            'rca_method', 'rca_method_display',
            'lead_investigator', 'created_by',
            'incident',
            'scope', 'timeline_of_events',
            'immediate_causes', 'contributing_factors',
            'findings', 'lessons_learned', 'recommendations',
            'target_completion_date', 'actual_completion_date',
            'closed_by', 'closed_at',
            'root_causes', 'team_memberships', 'status_history',
            'allowed_transitions', 'is_overdue',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reference_number', 'created_by',
            'closed_by', 'closed_at', 'actual_completion_date',
            'created_at', 'updated_at',
        ]

    def get_allowed_transitions(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        role = getattr(user, 'role', None) or 'employee'
        return [
            t for t in VALID_STATUS_TRANSITIONS.get(obj.status, [])
            if role in TRANSITION_PERMITTED_ROLES.get(t, [])
        ]

    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.target_completion_date and obj.status not in (InvestigationStatus.CLOSED,):
            return obj.target_completion_date < timezone.now().date()
        return False


class InvestigationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investigation
        fields = [
            'title', 'incident', 'rca_method',
            'lead_investigator', 'scope', 'target_completion_date',
        ]

    def validate_incident(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError(
                'Incident does not belong to your organization.'
            )
        # Prevent linking two investigations to the same incident
        if hasattr(value, 'investigation') and value.investigation is not None:
            raise serializers.ValidationError(
                'This incident already has an active investigation.'
            )
        return value

    def validate_lead_investigator(self, value):
        request = self.context.get('request')
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError(
                'Lead investigator must belong to your organization.'
            )
        return value


class InvestigationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investigation
        fields = [
            'title', 'rca_method', 'lead_investigator',
            'scope', 'timeline_of_events',
            'immediate_causes', 'contributing_factors',
            'findings', 'lessons_learned', 'recommendations',
            'target_completion_date',
        ]

    def validate(self, data):
        if self.instance and self.instance.status == InvestigationStatus.CLOSED:
            raise serializers.ValidationError(
                'A closed investigation cannot be edited. Reopen it first.'
            )
        return data

    def validate_lead_investigator(self, value):
        request = self.context.get('request')
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError(
                'Lead investigator must belong to your organization.'
            )
        return value


class StatusTransitionSerializer(serializers.Serializer):
    new_status = serializers.ChoiceField(choices=InvestigationStatus.choices)
    comment = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_new_status(self, value):
        investigation = self.context.get('investigation')
        if investigation:
            allowed = VALID_STATUS_TRANSITIONS.get(investigation.status, [])
            if value not in allowed:
                raise serializers.ValidationError(
                    f"Cannot transition from '{investigation.status}' to '{value}'. "
                    f"Allowed transitions: {allowed}"
                )
        return value


class AddTeamMemberSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()

    def validate_user_id(self, value):
        organization = self.context.get('organization')
        try:
            User.objects.get(id=value, organization=organization, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                'No active user with that ID found in your organization.'
            )
        return value


class InvestigationStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    this_month = serializers.IntegerField()
    open_count = serializers.IntegerField()
    in_progress_count = serializers.IntegerField()
    closed_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
