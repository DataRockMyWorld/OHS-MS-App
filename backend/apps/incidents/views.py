import logging
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Incident, IncidentAttachment
from .serializers import (
    IncidentListSerializer,
    IncidentDetailSerializer,
    IncidentCreateSerializer,
    IncidentUpdateSerializer,
    IncidentAttachmentSerializer,
    IncidentAttachmentUploadSerializer,
    IncidentStatusHistorySerializer,
    StatusTransitionSerializer,
    AssignIncidentSerializer,
    IncidentStatsSerializer,
)
from .permissions import IncidentPermission, IsHSEManagerOrAbove, IsOrgAdminOrAbove
from .filters import IncidentFilter
from .services import (
    IncidentService,
    IncidentServiceError,
    InvalidStatusTransitionError,
    TransitionPermissionError,
    AttachmentValidationError,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class IncidentViewSet(viewsets.ModelViewSet):
    """
    Full CRUD + custom actions for the Incident resource.
    All queries are automatically tenant-scoped to request.user.organization.
    """
    permission_classes = [IsAuthenticated, IncidentPermission]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = IncidentFilter
    ordering_fields = ['created_at', 'date_of_incident', 'severity', 'status', 'reference_number']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user

        base_qs = (
            Incident.objects
            .filter(organization=user.organization, is_deleted=False)
            .select_related(
                'reported_by',
                'assigned_to',
                'reviewed_by',
                'closed_by',
                'site',
                'department',
            )
            .annotate(_attachment_count=Count('attachments'))
        )

        # Employees see only their own incidents
        if user.role == 'employee':
            base_qs = base_qs.filter(reported_by=user)

        return base_qs

    def get_serializer_class(self):
        if self.action == 'list':
            return IncidentListSerializer
        if self.action == 'create':
            return IncidentCreateSerializer
        if self.action in ('update', 'partial_update'):
            return IncidentUpdateSerializer
        return IncidentDetailSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return ctx

    def perform_create(self, serializer):
        incident = IncidentService.create_incident(
            data=serializer.validated_data,
            reporter=self.request.user,
        )
        # Swap instance so the response uses IncidentDetailSerializer logic in create()
        serializer.instance = incident

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail_serializer = IncidentDetailSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        )
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        IncidentService.soft_delete(incident=instance, deleted_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        # Override destroy to use org-admin permission
        instance = self.get_object()
        if not IsOrgAdminOrAbove().has_permission(request, self):
            return Response(
                {'detail': 'Only Organization Admins can delete incidents.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── Custom actions ─────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        """Submit a DRAFT incident → REPORTED. Called by the reporter."""
        incident = self.get_object()
        if incident.status != 'draft':
            return Response(
                {'detail': 'Only draft incidents can be submitted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            incident = IncidentService.submit_incident(
                incident=incident,
                submitted_by=request.user,
            )
        except IncidentServiceError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            IncidentDetailSerializer(incident, context=self.get_serializer_context()).data
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='transition',
        permission_classes=[IsAuthenticated, IsHSEManagerOrAbove],
    )
    def transition(self, request, pk=None):
        """Transition incident status. Requires HSE Manager or above."""
        incident = self.get_object()
        serializer = StatusTransitionSerializer(
            data=request.data,
            context={'incident': incident, 'request': request},
        )
        serializer.is_valid(raise_exception=True)

        try:
            incident = IncidentService.transition_status(
                incident=incident,
                new_status=serializer.validated_data['new_status'],
                changed_by=request.user,
                comment=serializer.validated_data.get('comment', ''),
            )
        except (InvalidStatusTransitionError, TransitionPermissionError) as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            IncidentDetailSerializer(incident, context=self.get_serializer_context()).data
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='assign',
        permission_classes=[IsAuthenticated, IsHSEManagerOrAbove],
    )
    def assign(self, request, pk=None):
        """Assign incident to a user within the organization."""
        incident = self.get_object()
        serializer = AssignIncidentSerializer(
            data=request.data,
            context={'organization': incident.organization, 'request': request},
        )
        serializer.is_valid(raise_exception=True)

        assignee = User.objects.get(id=serializer.validated_data['assignee_id'])

        try:
            incident = IncidentService.assign_incident(
                incident=incident,
                assignee=assignee,
                assigned_by=request.user,
                comment=serializer.validated_data.get('comment', ''),
            )
        except IncidentServiceError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            IncidentDetailSerializer(incident, context=self.get_serializer_context()).data
        )

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        """Return the full status audit trail for an incident."""
        incident = self.get_object()
        qs = incident.status_history.select_related('changed_by').all()
        serializer = IncidentStatusHistorySerializer(
            qs, many=True, context=self.get_serializer_context()
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Return aggregate incident statistics for the current organization."""
        data = IncidentService.get_organization_stats(request.user.organization_id)
        serializer = IncidentStatsSerializer(data)
        return Response(serializer.data)

    # ── Attachment sub-actions ─────────────────────────────────────────────────

    @action(
        detail=True,
        methods=['post'],
        url_path='attachments',
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_attachment(self, request, pk=None):
        """Upload a file or photo to an incident."""
        incident = self.get_object()
        serializer = IncidentAttachmentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            attachment = IncidentService.add_attachment(
                incident=incident,
                file=serializer.validated_data['file'],
                uploaded_by=request.user,
                caption=serializer.validated_data.get('caption', ''),
            )
        except AttachmentValidationError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            IncidentAttachmentSerializer(attachment, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'attachments/(?P<attachment_id>[^/.]+)',
    )
    def delete_attachment(self, request, pk=None, attachment_id=None):
        """Delete an attachment. Only the uploader or HSE Manager+ may delete."""
        incident = self.get_object()
        attachment = get_object_or_404(
            IncidentAttachment,
            id=attachment_id,
            incident=incident,
        )

        can_delete = (
            str(attachment.uploaded_by_id) == str(request.user.id)
            or request.user.role in ('hse_manager', 'org_admin', 'super_admin')
        )
        if not can_delete:
            return Response(
                {'detail': 'You do not have permission to delete this attachment.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        attachment.file.delete(save=False)
        attachment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
