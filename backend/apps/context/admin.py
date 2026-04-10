from django.contrib import admin
from .models import ManagementSystemScope, InterestedParty, ContextIssue, RiskOrOpportunity


@admin.register(ManagementSystemScope)
class ManagementSystemScopeAdmin(admin.ModelAdmin):
    list_display = ['organization', 'updated_by', 'updated_at']
    readonly_fields = ['updated_at', 'created_at']


@admin.register(InterestedParty)
class InterestedPartyAdmin(admin.ModelAdmin):
    list_display = ['name', 'party_type', 'is_compliance_obligation', 'status', 'organization']
    list_filter = ['party_type', 'status', 'is_compliance_obligation']
    search_fields = ['name']


@admin.register(ContextIssue)
class ContextIssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'analysis_tag', 'classification', 'status', 'organization']
    list_filter = ['type', 'classification', 'status', 'analysis_tag']
    search_fields = ['title']


@admin.register(RiskOrOpportunity)
class RiskOrOpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'severity_level', 'status', 'owner', 'organization']
    list_filter = ['type', 'severity_level', 'status']
    search_fields = ['title']
