import logging
from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Investigation, RootCause, InvestigationTeamMember
from .serializers import (
    InvestigationListSerializer,
    InvestigationDetailSerializer,
    InvestigationCreateSerializer,
    InvestigationUpdateSerializer,
    InvestigationStatusHistorySerializer,
    StatusTransitionSerializer,
    AddTeamMemberSerializer,
    RootCauseSerializer,
    RootCauseCreateSerializer,
    InvestigationStatsSerializer,
)
from .permissions import InvestigationPermission, IsHSEManagerOrAbove, IsOrgAdminOrAbove
from .filters import InvestigationFilter
from .services import (
    InvestigationService,
    InvestigationServiceError,
    InvalidStatusTransitionError,
    TransitionPermissionError,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class InvestigationViewSet(viewsets.ModelViewSet):
    """
    Full CRUD + custom actions for the Investigation resource.
    All queries are automatically tenant-scoped to request.user.organization.
    """
    permission_classes = [IsAuthenticated, InvestigationPermission]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = InvestigationFilter
    ordering_fields = ['created_at', 'target_completion_date', 'status', 'reference_number']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user

        base_qs = (
            Investigation.objects
            .filter(organization=user.organization, is_deleted=False)
            .select_related(
                'lead_investigator',
                'created_by',
                'closed_by',
                'incident',
            )
            .annotate(_root_cause_count=Count('root_causes', distinct=True))
        )

        # Employees see only investigations linked to their own incidents
        if user.role == 'employee':
            base_qs = base_qs.filter(incident__reported_by=user)

        return base_qs

    def get_serializer_class(self):
        if self.action == 'list':
            return InvestigationListSerializer
        if self.action == 'create':
            return InvestigationCreateSerializer
        if self.action in ('update', 'partial_update'):
            return InvestigationUpdateSerializer
        return InvestigationDetailSerializer

    def perform_create(self, serializer):
        investigation = InvestigationService.create_investigation(
            data=serializer.validated_data,
            created_by=self.request.user,
        )
        serializer.instance = investigation

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail_serializer = InvestigationDetailSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        )
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        instance = self.get_object()
        InvestigationService.auto_advance(instance)
        instance.refresh_from_db()
        return Response(
            InvestigationDetailSerializer(instance, context=self.get_serializer_context()).data
        )

    def perform_destroy(self, instance):
        InvestigationService.soft_delete(
            investigation=instance,
            deleted_by=self.request.user,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not IsOrgAdminOrAbove().has_permission(request, self):
            return Response(
                {'detail': 'Only Organization Admins can delete investigations.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── Custom actions ──────────────────────────────────────────────────────────

    @action(
        detail=True,
        methods=['post'],
        url_path='transition',
    )
    def transition(self, request, pk=None):
        """Transition investigation status. Role restrictions are enforced by the service layer."""
        investigation = self.get_object()
        serializer = StatusTransitionSerializer(
            data=request.data,
            context={'investigation': investigation, 'request': request},
        )
        serializer.is_valid(raise_exception=True)

        try:
            investigation = InvestigationService.transition_status(
                investigation=investigation,
                new_status=serializer.validated_data['new_status'],
                changed_by=request.user,
                comment=serializer.validated_data.get('comment', ''),
            )
        except (InvalidStatusTransitionError, TransitionPermissionError) as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            InvestigationDetailSerializer(investigation, context=self.get_serializer_context()).data
        )

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        """Return the full status audit trail for an investigation."""
        investigation = self.get_object()
        qs = investigation.status_history.select_related('changed_by').all()
        return Response(
            InvestigationStatusHistorySerializer(qs, many=True, context=self.get_serializer_context()).data
        )

    # ── Root cause sub-actions ──────────────────────────────────────────────────

    @action(detail=True, methods=['get', 'post'], url_path='root-causes')
    def root_causes(self, request, pk=None):
        investigation = self.get_object()

        if request.method == 'GET':
            qs = investigation.root_causes.all()
            return Response(
                RootCauseSerializer(qs, many=True, context=self.get_serializer_context()).data
            )

        # POST — add a root cause
        serializer = RootCauseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        root_cause = InvestigationService.add_root_cause(
            investigation=investigation,
            data=serializer.validated_data,
        )
        InvestigationService.auto_advance(investigation)
        return Response(
            RootCauseSerializer(root_cause, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'root-causes/(?P<rc_id>[^/.]+)',
    )
    def delete_root_cause(self, request, pk=None, rc_id=None):
        investigation = self.get_object()
        try:
            rc = RootCause.objects.get(id=rc_id, investigation=investigation)
        except RootCause.DoesNotExist:
            return Response({'detail': 'Root cause not found.'}, status=status.HTTP_404_NOT_FOUND)
        rc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── Team sub-actions ────────────────────────────────────────────────────────

    @action(
        detail=True,
        methods=['post'],
        url_path='team',
        permission_classes=[IsAuthenticated, IsHSEManagerOrAbove],
    )
    def add_team_member(self, request, pk=None):
        investigation = self.get_object()
        serializer = AddTeamMemberSerializer(
            data=request.data,
            context={'organization': investigation.organization, 'request': request},
        )
        serializer.is_valid(raise_exception=True)

        user = User.objects.get(id=serializer.validated_data['user_id'])
        try:
            InvestigationService.add_team_member(investigation=investigation, user=user)
        except InvestigationServiceError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            InvestigationDetailSerializer(investigation, context=self.get_serializer_context()).data
        )

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'team/(?P<user_id>[^/.]+)',
        permission_classes=[IsAuthenticated, IsHSEManagerOrAbove],
    )
    def remove_team_member(self, request, pk=None, user_id=None):
        investigation = self.get_object()
        try:
            user = User.objects.get(id=user_id, organization=investigation.organization)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        InvestigationService.remove_team_member(investigation=investigation, user=user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── Stats ───────────────────────────────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Return aggregate investigation statistics for the current organization."""
        data = InvestigationService.get_organization_stats(request.user.organization_id)
        return Response(InvestigationStatsSerializer(data).data)
