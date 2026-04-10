from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import Organization
from .models import AnonymousIncidentReport
from .constants import IncidentType


class AnonymousReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnonymousIncidentReport
        fields = [
            'title', 'description', 'incident_type', 'date_of_incident',
            'location', 'immediate_action_taken',
            'reporter_name', 'reporter_contact',
        ]


class AnonymousReportView(APIView):
    """
    Public endpoint — no authentication required.
    POST /api/v1/public/report/<org_slug>/
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # Bypass JWT auth entirely

    def post(self, request, org_slug):
        org = get_object_or_404(Organization, slug=org_slug, is_active=True)
        serializer = AnonymousReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(organization=org)
        return Response(
            {'detail': 'Your report has been submitted. Thank you.'},
            status=status.HTTP_201_CREATED,
        )


class AnonymousReportListSerializer(serializers.ModelSerializer):
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)
    converted_incident_ref = serializers.CharField(
        source='converted_incident.reference_number', read_only=True, default=None
    )
    reviewer_name = serializers.CharField(
        source='reviewed_by.get_full_name', read_only=True, default=None
    )

    class Meta:
        model = AnonymousIncidentReport
        fields = [
            'id', 'title', 'description', 'incident_type', 'incident_type_display',
            'date_of_incident', 'location', 'immediate_action_taken',
            'reporter_name', 'reporter_contact',
            'is_reviewed', 'reviewed_at', 'reviewer_name', 'review_notes',
            'converted_incident_ref', 'created_at',
        ]


class AnonymousReportAdminListView(APIView):
    """
    GET /api/v1/anonymous-reports/   — list for HSE managers to review
    PATCH /api/v1/anonymous-reports/<uuid>/  — mark reviewed / add notes
    """
    from rest_framework.permissions import IsAuthenticated

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = AnonymousIncidentReport.objects.filter(
            organization_id=request.user.organization_id
        ).select_related('reviewed_by', 'converted_incident')

        reviewed = request.query_params.get('reviewed')
        if reviewed == 'true':
            qs = qs.filter(is_reviewed=True)
        elif reviewed == 'false':
            qs = qs.filter(is_reviewed=False)

        return Response(AnonymousReportListSerializer(qs, many=True).data)


class AnonymousReportAdminDetailView(APIView):
    from rest_framework.permissions import IsAuthenticated

    permission_classes = [IsAuthenticated]

    def _get_report(self, request, pk):
        return get_object_or_404(
            AnonymousIncidentReport,
            pk=pk,
            organization_id=request.user.organization_id,
        )

    def get(self, request, pk):
        report = self._get_report(request, pk)
        return Response(AnonymousReportListSerializer(report).data)

    def patch(self, request, pk):
        from django.utils import timezone as tz
        report = self._get_report(request, pk)

        if 'review_notes' in request.data:
            report.review_notes = request.data['review_notes']
        if request.data.get('is_reviewed') is True or request.data.get('is_reviewed') == 'true':
            report.is_reviewed = True
            report.reviewed_by = request.user
            report.reviewed_at = tz.now()

        report.save()
        return Response(AnonymousReportListSerializer(report).data)
