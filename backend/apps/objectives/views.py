from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Objective, KPIMeasurement
from .serializers import (
    ObjectiveListSerializer,
    ObjectiveDetailSerializer,
    KPIMeasurementSerializer,
)
from .services import ObjectiveService


class ObjectiveListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Return plain array — client handles filtering

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ObjectiveDetailSerializer
        return ObjectiveListSerializer

    def get_queryset(self):
        org_id = self.request.user.organization_id
        qs = Objective.objects.filter(organization_id=org_id).select_related('owner', 'created_by')

        scope = self.request.query_params.get('scope')
        if scope:
            qs = qs.filter(scope=scope)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        owner = self.request.query_params.get('owner')
        if owner:
            qs = qs.filter(owner_id=owner)

        return qs

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user,
        )


class ObjectiveDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ObjectiveDetailSerializer

    def get_queryset(self):
        return Objective.objects.filter(
            organization_id=self.request.user.organization_id
        ).select_related('owner', 'created_by')

    def perform_destroy(self, instance):
        """Soft delete — set status to closed instead of deleting."""
        instance.status = Objective.Status.CLOSED
        instance.save()


class ComputeMetricView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            objective = Objective.objects.get(
                pk=pk,
                organization_id=request.user.organization_id,
            )
        except Objective.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if objective.linked_metric == Objective.LinkedMetric.MANUAL:
            return Response(
                {'detail': 'This objective uses manual entry. No metric to compute.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start, end = ObjectiveService._get_period_window(objective.measurement_frequency)
        value = ObjectiveService.compute_metric(
            organization_id=request.user.organization_id,
            linked_metric=objective.linked_metric,
            frequency=objective.measurement_frequency,
        )

        return Response({
            'suggested_value': str(value),
            'metric': objective.linked_metric,
            'period_start': start.isoformat(),
            'period_end': end.isoformat(),
        })


class MeasurementListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = KPIMeasurementSerializer

    def get_queryset(self):
        objective_id = self.kwargs['pk']
        return KPIMeasurement.objects.filter(
            objective_id=objective_id,
            objective__organization_id=self.request.user.organization_id,
        ).select_related('recorded_by')

    def perform_create(self, serializer):
        objective_id = self.kwargs['pk']
        try:
            objective = Objective.objects.get(
                pk=objective_id,
                organization_id=self.request.user.organization_id,
            )
        except Objective.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Objective not found.')

        measurement = serializer.save(
            objective=objective,
            recorded_by=self.request.user,
        )
        ObjectiveService.update_objective_after_measurement(objective, measurement.value)


class ObjectiveStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org_id = request.user.organization_id
        qs = Objective.objects.filter(organization_id=org_id)

        total = qs.count()
        on_track = qs.filter(status=Objective.Status.ON_TRACK).count()
        at_risk = qs.filter(status=Objective.Status.AT_RISK).count()
        behind = qs.filter(status=Objective.Status.BEHIND).count()
        achieved = qs.filter(status=Objective.Status.ACHIEVED).count()
        individual_count = qs.filter(scope=Objective.Scope.INDIVIDUAL).count()
        organizational_count = qs.filter(scope=Objective.Scope.ORGANIZATIONAL).count()

        return Response({
            'total': total,
            'on_track': on_track,
            'at_risk': at_risk,
            'behind': behind,
            'achieved': achieved,
            'individual_count': individual_count,
            'organizational_count': organizational_count,
        })


class LeagueTableView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org_id = request.user.organization_id
        rows = ObjectiveService.get_league_table(organization_id=org_id, scope='individual')
        return Response(rows)
