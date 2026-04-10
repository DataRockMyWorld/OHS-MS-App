from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Audit, AuditFinding
from .serializers import (
    AuditListSerializer,
    AuditDetailSerializer,
    AuditCreateSerializer,
    AuditFindingSerializer,
)
from .constants import AuditStatus, FindingStatus
from apps.corrective_actions.models import CorrectiveAction
from apps.corrective_actions.constants import CAStatus, CASource


class AuditListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AuditCreateSerializer
        return AuditListSerializer

    def get_queryset(self):
        org_id = self.request.user.organization_id
        qs = Audit.objects.filter(
            organization_id=org_id, is_deleted=False
        ).select_related('lead_auditor', 'department').prefetch_related('findings')

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        audit_type = self.request.query_params.get('audit_type')
        if audit_type:
            qs = qs.filter(audit_type=audit_type)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        audit = serializer.save(
            organization=request.user.organization,
            created_by=request.user,
        )
        return Response(
            AuditDetailSerializer(audit, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


class AuditDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Audit.objects.filter(
            organization_id=self.request.user.organization_id,
            is_deleted=False,
        ).select_related('lead_auditor', 'department').prefetch_related(
            'findings__corrective_action'
        )

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return AuditCreateSerializer
        return AuditDetailSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instance.refresh_from_db()
        return Response(
            AuditDetailSerializer(instance, context=self.get_serializer_context()).data
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])


class AuditCompleteView(APIView):
    """Mark an audit as completed (in_progress → completed)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        audit = get_object_or_404(
            Audit,
            pk=pk,
            organization_id=request.user.organization_id,
            is_deleted=False,
        )
        if audit.status == AuditStatus.COMPLETED:
            return Response({'detail': 'Audit is already completed.'}, status=status.HTTP_400_BAD_REQUEST)
        if audit.status == AuditStatus.CANCELLED:
            return Response({'detail': 'Cannot complete a cancelled audit.'}, status=status.HTTP_400_BAD_REQUEST)

        audit.status = AuditStatus.COMPLETED
        audit.completed_at = timezone.now()
        if not audit.actual_date:
            audit.actual_date = timezone.now().date()

        summary = request.data.get('summary', '')
        conclusion = request.data.get('overall_conclusion', '')
        if summary:
            audit.summary = summary
        if conclusion:
            audit.overall_conclusion = conclusion

        audit.save()
        return Response(AuditDetailSerializer(audit, context={'request': request}).data)


class AuditFindingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_audit(self, request, audit_pk):
        return get_object_or_404(
            Audit,
            pk=audit_pk,
            organization_id=request.user.organization_id,
            is_deleted=False,
        )

    def get(self, request, audit_pk):
        audit = self._get_audit(request, audit_pk)
        findings = audit.findings.select_related('corrective_action').all()
        return Response(AuditFindingSerializer(findings, many=True).data)

    def post(self, request, audit_pk):
        audit = self._get_audit(request, audit_pk)
        serializer = AuditFindingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        finding = serializer.save(audit=audit)
        return Response(AuditFindingSerializer(finding).data, status=status.HTTP_201_CREATED)


class AuditFindingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_finding(self, request, audit_pk, finding_pk):
        return get_object_or_404(
            AuditFinding,
            pk=finding_pk,
            audit__pk=audit_pk,
            audit__organization_id=request.user.organization_id,
            audit__is_deleted=False,
        )

    def patch(self, request, audit_pk, finding_pk):
        finding = self._get_finding(request, audit_pk, finding_pk)
        serializer = AuditFindingSerializer(finding, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        finding.refresh_from_db()
        return Response(AuditFindingSerializer(finding).data)

    def delete(self, request, audit_pk, finding_pk):
        finding = self._get_finding(request, audit_pk, finding_pk)
        finding.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RaiseCAfromFindingView(APIView):
    """Raise a Corrective Action from an audit finding and link them."""
    permission_classes = [IsAuthenticated]

    def post(self, request, audit_pk, finding_pk):
        finding = get_object_or_404(
            AuditFinding,
            pk=finding_pk,
            audit__pk=audit_pk,
            audit__organization_id=request.user.organization_id,
            audit__is_deleted=False,
        )

        if finding.corrective_action_id:
            return Response(
                {'detail': 'A corrective action has already been raised for this finding.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ca = CorrectiveAction.objects.create(
            organization=request.user.organization,
            title=f"[Audit Finding] {finding.title}",
            description=finding.description,
            source_type=CASource.AUDIT,
            status=CAStatus.OPEN,
            created_by=request.user,
        )
        finding.corrective_action = ca
        finding.status = FindingStatus.RAISED
        finding.save(update_fields=['corrective_action', 'status'])

        return Response({
            'ca_id': str(ca.id),
            'ca_reference': ca.reference_number,
            'finding_id': str(finding.id),
        }, status=status.HTTP_201_CREATED)
