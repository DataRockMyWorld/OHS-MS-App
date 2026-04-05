from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import Incident, IncidentAttachment, IncidentStatusHistory
from .constants import (
    IncidentStatus,
    VALID_STATUS_TRANSITIONS,
    ALLOWED_ATTACHMENT_MIME_TYPES,
    MAX_ATTACHMENT_SIZE_BYTES,
)

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'job_title', 'role']
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class IncidentAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserMinimalSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = IncidentAttachment
        fields = [
            'id', 'file_url', 'file_name', 'file_type', 'file_size',
            'caption', 'is_photo', 'uploaded_by', 'created_at',
        ]
        read_only_fields = fields

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            url = obj.file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class IncidentAttachmentUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    caption = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')

    def validate_file(self, value):
        if value.content_type not in ALLOWED_ATTACHMENT_MIME_TYPES:
            raise serializers.ValidationError(
                f"Unsupported file type: {value.content_type}."
            )
        if value.size > MAX_ATTACHMENT_SIZE_BYTES:
            mb = MAX_ATTACHMENT_SIZE_BYTES // (1024 * 1024)
            raise serializers.ValidationError(
                f"File size cannot exceed {mb}MB."
            )
        return value


class IncidentStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = UserMinimalSerializer(read_only=True)
    from_status_display = serializers.SerializerMethodField()
    to_status_display = serializers.SerializerMethodField()

    class Meta:
        model = IncidentStatusHistory
        fields = [
            'id', 'from_status', 'from_status_display',
            'to_status', 'to_status_display',
            'changed_by', 'comment', 'created_at',
        ]
        read_only_fields = fields

    def get_from_status_display(self, obj):
        return dict(IncidentStatus.choices).get(obj.from_status, obj.from_status)

    def get_to_status_display(self, obj):
        return dict(IncidentStatus.choices).get(obj.to_status, obj.to_status)


class IncidentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — no nesting beyond user stubs."""
    reported_by = UserMinimalSerializer(read_only=True)
    assigned_to = UserMinimalSerializer(read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True, default=None)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    attachment_count = serializers.SerializerMethodField()
    allowed_transitions = serializers.SerializerMethodField()
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Incident
        fields = [
            'id', 'reference_number', 'title',
            'incident_type', 'incident_type_display',
            'severity', 'severity_display',
            'status', 'status_display',
            'date_of_incident', 'report_date',
            'reported_by', 'assigned_to',
            'site_name', 'department_name',
            'injury_occurred', 'environmental_impact', 'property_damage',
            'attachment_count', 'allowed_transitions',
            'created_at',
        ]
        read_only_fields = fields

    def get_attachment_count(self, obj):
        # Prefer annotated value to avoid N+1
        if hasattr(obj, '_attachment_count'):
            return obj._attachment_count
        return obj.attachments.count()

    def get_allowed_transitions(self, obj):
        return VALID_STATUS_TRANSITIONS.get(obj.status, [])


class IncidentDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views — includes nested attachments and history."""
    reported_by = UserMinimalSerializer(read_only=True)
    assigned_to = UserMinimalSerializer(read_only=True)
    reviewed_by = UserMinimalSerializer(read_only=True)
    closed_by = UserMinimalSerializer(read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True, default=None)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    attachments = IncidentAttachmentSerializer(many=True, read_only=True)
    status_history = IncidentStatusHistorySerializer(many=True, read_only=True)
    allowed_transitions = serializers.SerializerMethodField()
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Incident
        fields = [
            'id', 'reference_number',
            'title', 'incident_type', 'incident_type_display',
            'date_of_incident', 'time_of_incident',
            'site', 'site_name', 'location_detail',
            'department', 'department_name',
            'description', 'persons_involved', 'witnesses',
            'immediate_action_taken',
            'injury_occurred', 'environmental_impact', 'property_damage',
            'severity', 'severity_display',
            'status', 'status_display',
            'reported_by', 'report_date',
            'assigned_to', 'assigned_at',
            'reviewed_by', 'reviewed_at',
            'closed_by', 'closed_at', 'closure_notes',
            'investigation_id',
            'attachments', 'status_history',
            'allowed_transitions',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reference_number', 'reported_by', 'report_date',
            'reviewed_by', 'reviewed_at', 'closed_by', 'closed_at',
            'created_at', 'updated_at',
        ]

    def get_allowed_transitions(self, obj):
        return VALID_STATUS_TRANSITIONS.get(obj.status, [])


class IncidentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = [
            'title', 'incident_type', 'date_of_incident', 'time_of_incident',
            'site', 'location_detail', 'department',
            'description', 'persons_involved', 'witnesses',
            'immediate_action_taken',
            'injury_occurred', 'environmental_impact', 'property_damage',
            'severity',
        ]

    def validate_date_of_incident(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError(
                "The date of incident cannot be in the future."
            )
        return value

    def validate_site(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError(
                "Site does not belong to your organization."
            )
        return value

    def validate_department(self, value):
        if value is None:
            return value
        request = self.context.get('request')
        if request and value.organization_id != request.user.organization_id:
            raise serializers.ValidationError(
                "Department does not belong to your organization."
            )
        return value


class IncidentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = [
            'title', 'incident_type', 'date_of_incident', 'time_of_incident',
            'site', 'location_detail', 'department',
            'description', 'persons_involved', 'witnesses',
            'immediate_action_taken',
            'injury_occurred', 'environmental_impact', 'property_damage',
            'severity', 'closure_notes',
        ]

    def validate(self, data):
        instance = self.instance
        if instance and instance.status == IncidentStatus.CLOSED:
            allowed_on_closed = {'closure_notes'}
            if set(data.keys()) - allowed_on_closed:
                raise serializers.ValidationError(
                    "Only closure notes can be updated on a closed incident."
                )
        return data


class StatusTransitionSerializer(serializers.Serializer):
    new_status = serializers.ChoiceField(choices=IncidentStatus.choices)
    comment = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_new_status(self, value):
        incident = self.context.get('incident')
        if incident:
            allowed = VALID_STATUS_TRANSITIONS.get(incident.status, [])
            if value not in allowed:
                raise serializers.ValidationError(
                    f"Cannot transition from '{incident.status}' to '{value}'. "
                    f"Allowed transitions: {allowed}"
                )
        return value


class AssignIncidentSerializer(serializers.Serializer):
    assignee_id = serializers.UUIDField()
    comment = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_assignee_id(self, value):
        organization = self.context.get('organization')
        try:
            User.objects.get(id=value, organization=organization, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No active user with that ID found in your organization."
            )
        return value


class IncidentStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    this_month = serializers.IntegerField()
    open_count = serializers.IntegerField()
    under_review_count = serializers.IntegerField()
    investigation_count = serializers.IntegerField()
    closed_count = serializers.IntegerField()
    critical_count = serializers.IntegerField()
