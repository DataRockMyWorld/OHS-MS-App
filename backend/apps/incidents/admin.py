from django.contrib import admin
from .models import Incident, IncidentAttachment, IncidentStatusHistory


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = [
        'reference_number', 'title', 'incident_type', 'severity',
        'status', 'reported_by', 'organization', 'date_of_incident', 'is_deleted',
    ]
    list_filter = ['status', 'severity', 'incident_type', 'organization', 'is_deleted']
    search_fields = ['title', 'reference_number', 'description']
    readonly_fields = ['id', 'reference_number', 'created_at', 'updated_at']
    raw_id_fields = ['reported_by', 'assigned_to', 'reviewed_by', 'closed_by', 'organization']


@admin.register(IncidentAttachment)
class IncidentAttachmentAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'incident', 'file_type', 'file_size', 'uploaded_by', 'created_at']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['incident', 'uploaded_by', 'organization']


@admin.register(IncidentStatusHistory)
class IncidentStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['incident', 'from_status', 'to_status', 'changed_by', 'created_at']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['incident', 'changed_by', 'organization']
