import logging
from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import CorrectiveAction, EffectivenessReview
from .serializers import (
    CAListSerializer,
    CADetailSerializer,
    CACreateSerializer,
    CAUpdateSerializer,
    CAStatusHistorySerializer,
    CATransitionSerializer,
    EffectivenessReviewSerializer,
    EffectivenessReviewCreateSerializer,
    CAStatsSerializer,
)
from .permissions import CAPermission, IsHSEManagerOrAbove, IsOrgAdminOrAbove
from .filters import CAFilter
from .services import (
    CorrectiveActionService,
    CAServiceError,
    InvalidStatusTransitionError,
    TransitionPermissionError,
    EffectivenessReviewError,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class CorrectiveActionViewSet(viewsets.ModelViewSet):
    """
    Full CRUD + custom actions for the CorrectiveAction resource.
    All queries are automatically tenant-scoped to request.user.organization.
    """
    permission_classes = [IsAuthenticated, CAPermission]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = CAFilter
    ordering_fields = ['created_at', 'target_date', 'status', 'priority', 'reference_number']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user

        return (
            CorrectiveAction.objects
            .filter(organization=user.organization, is_deleted=False)
            .select_related(
                'assigned_to',
                'created_by',
                'closed_by',
                'source_investigation',
                'source_incident',
            )
            .annotate(
                _effectiveness_review_count=Count('effectiveness_reviews', distinct=True),
            )
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return CAListSerializer
        if self.action == 'create':
            return CACreateSerializer
        if self.action in ('update', 'partial_update'):
            return CAUpdateSerializer
        return CADetailSerializer

    def perform_create(self, serializer):
        ca = CorrectiveActionService.create_ca(
            data=serializer.validated_data,
            created_by=self.request.user,
        )
        serializer.instance = ca

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail_serializer = CADetailSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        )
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        CorrectiveActionService.soft_delete(
            ca=instance,
            deleted_by=self.request.user,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not IsOrgAdminOrAbove().has_permission(request, self):
            return Response(
                {'detail': 'Only Organization Admins can delete corrective actions.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── Custom actions ──────────────────────────────────────────────────────────

    @action(
        detail=True,
        methods=['post'],
        url_path='transition',
        permission_classes=[IsAuthenticated, CAPermission],
    )
    def transition(self, request, pk=None):
        """Transition corrective action status."""
        ca = self.get_object()
        serializer = CATransitionSerializer(
            data=request.data,
            context={'ca': ca, 'request': request},
        )
        serializer.is_valid(raise_exception=True)

        try:
            ca = CorrectiveActionService.transition_status(
                ca=ca,
                new_status=serializer.validated_data['new_status'],
                changed_by=request.user,
                comment=serializer.validated_data.get('comment', ''),
            )
        except (InvalidStatusTransitionError, TransitionPermissionError) as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            CADetailSerializer(ca, context=self.get_serializer_context()).data
        )

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        """Return the full status audit trail."""
        ca = self.get_object()
        qs = ca.status_history.select_related('changed_by').all()
        return Response(
            CAStatusHistorySerializer(qs, many=True, context=self.get_serializer_context()).data
        )

    # ── Effectiveness reviews ───────────────────────────────────────────────────

    @action(detail=True, methods=['get', 'post'], url_path='effectiveness-reviews')
    def effectiveness_reviews(self, request, pk=None):
        ca = self.get_object()

        if request.method == 'GET':
            qs = ca.effectiveness_reviews.select_related('reviewer').all()
            return Response(
                EffectivenessReviewSerializer(
                    qs, many=True, context=self.get_serializer_context()
                ).data
            )

        # POST — add a review
        if not IsHSEManagerOrAbove().has_permission(request, self):
            return Response(
                {'detail': 'Only HSE Managers or above can record effectiveness reviews.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = EffectivenessReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            review = CorrectiveActionService.add_effectiveness_review(
                ca=ca,
                data=serializer.validated_data,
                reviewer=request.user,
            )
        except EffectivenessReviewError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # Re-fetch ca for updated status
        ca.refresh_from_db()
        return Response(
            CADetailSerializer(ca, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    # ── Stats ───────────────────────────────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Return aggregate corrective action statistics for the current organization."""
        data = CorrectiveActionService.get_organization_stats(request.user.organization_id)
        return Response(CAStatsSerializer(data).data)
