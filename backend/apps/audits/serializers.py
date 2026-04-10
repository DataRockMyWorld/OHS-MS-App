from rest_framework import serializers
from .models import Audit, AuditFinding
from .constants import AuditStatus


class AuditFindingSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    ca_reference = serializers.CharField(
        source='corrective_action.reference_number', read_only=True, default=None
    )
    ca_id = serializers.UUIDField(
        source='corrective_action.id', read_only=True, default=None
    )

    class Meta:
        model = AuditFinding
        fields = [
            'id', 'title', 'description', 'severity', 'severity_display',
            'status', 'status_display', 'clause_reference', 'evidence',
            'recommended_action', 'ca_reference', 'ca_id', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'ca_reference', 'ca_id', 'created_at', 'updated_at']


class AuditListSerializer(serializers.ModelSerializer):
    audit_type_display = serializers.CharField(source='get_audit_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    lead_auditor_name = serializers.CharField(
        source='lead_auditor.get_full_name', read_only=True, default=None
    )
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    finding_count = serializers.IntegerField(source='findings.count', read_only=True)
    open_finding_count = serializers.SerializerMethodField()

    class Meta:
        model = Audit
        fields = [
            'id', 'reference_number', 'title', 'audit_type', 'audit_type_display',
            'status', 'status_display', 'planned_date', 'actual_date',
            'department_name', 'location', 'lead_auditor_name',
            'finding_count', 'open_finding_count',
        ]

    def get_open_finding_count(self, obj):
        return obj.findings.filter(status='open').count()


class AuditDetailSerializer(serializers.ModelSerializer):
    audit_type_display = serializers.CharField(source='get_audit_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    lead_auditor_detail = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    findings = AuditFindingSerializer(many=True, read_only=True)

    class Meta:
        model = Audit
        fields = [
            'id', 'reference_number', 'title', 'audit_type', 'audit_type_display',
            'status', 'status_display', 'scope', 'objectives', 'criteria',
            'planned_date', 'actual_date', 'department', 'department_name',
            'location', 'lead_auditor', 'lead_auditor_detail', 'auditee',
            'summary', 'overall_conclusion', 'completed_at',
            'findings', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reference_number', 'status', 'completed_at', 'created_at', 'updated_at',
        ]

    def get_lead_auditor_detail(self, obj):
        if not obj.lead_auditor:
            return None
        u = obj.lead_auditor
        return {'id': str(u.id), 'full_name': u.get_full_name(), 'email': u.email}


class AuditCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = [
            'title', 'audit_type', 'scope', 'objectives', 'criteria',
            'planned_date', 'actual_date', 'department', 'location',
            'lead_auditor', 'auditee',
        ]
