from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import HazardAssessment, Hazard
from .serializers import (
    HazardAssessmentListSerializer,
    HazardAssessmentDetailSerializer,
    HazardAssessmentCreateSerializer,
    HazardSerializer,
)
from .constants import AssessmentStatus


class HazardAssessmentListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return HazardAssessmentCreateSerializer
        return HazardAssessmentListSerializer

    def get_queryset(self):
        org_id = self.request.user.organization_id
        qs = HazardAssessment.objects.filter(
            organization_id=org_id, is_deleted=False
        ).select_related('assessed_by', 'reviewed_by', 'department')

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        work_area = self.request.query_params.get('work_area')
        if work_area:
            qs = qs.filter(work_area__icontains=work_area)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)

        return qs

    def perform_create(self, serializer):
        assessment = serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user,
            status=AssessmentStatus.DRAFT,
        )
        # Return full detail on create
        return assessment

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assessment = serializer.save(
            organization=request.user.organization,
            created_by=request.user,
            status=AssessmentStatus.DRAFT,
        )
        return Response(
            HazardAssessmentDetailSerializer(assessment, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


class HazardAssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HazardAssessment.objects.filter(
            organization_id=self.request.user.organization_id,
            is_deleted=False,
        ).select_related('assessed_by', 'reviewed_by', 'department').prefetch_related('hazards__responsible_person')

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return HazardAssessmentCreateSerializer
        return HazardAssessmentDetailSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instance.refresh_from_db()
        return Response(
            HazardAssessmentDetailSerializer(instance, context=self.get_serializer_context()).data
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])


class AssessmentStatusView(APIView):
    """Transition assessment status (draft → active → under_review → archived)."""
    permission_classes = [IsAuthenticated]

    VALID_TRANSITIONS = {
        AssessmentStatus.DRAFT: [AssessmentStatus.ACTIVE],
        AssessmentStatus.ACTIVE: [AssessmentStatus.UNDER_REVIEW, AssessmentStatus.ARCHIVED],
        AssessmentStatus.UNDER_REVIEW: [AssessmentStatus.ACTIVE, AssessmentStatus.ARCHIVED],
        AssessmentStatus.ARCHIVED: [AssessmentStatus.ACTIVE],
    }

    def post(self, request, pk):
        assessment = get_object_or_404(
            HazardAssessment,
            pk=pk,
            organization_id=request.user.organization_id,
            is_deleted=False,
        )
        new_status = request.data.get('status')
        allowed = self.VALID_TRANSITIONS.get(assessment.status, [])
        if new_status not in allowed:
            return Response(
                {'detail': f'Cannot transition from {assessment.status} to {new_status}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        assessment.status = new_status
        assessment.save(update_fields=['status'])
        return Response(
            HazardAssessmentDetailSerializer(assessment, context={'request': request}).data
        )


class HazardListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_assessment(self, request, assessment_pk):
        return get_object_or_404(
            HazardAssessment,
            pk=assessment_pk,
            organization_id=request.user.organization_id,
            is_deleted=False,
        )

    def get(self, request, assessment_pk):
        assessment = self._get_assessment(request, assessment_pk)
        hazards = assessment.hazards.select_related('responsible_person').all()
        return Response(HazardSerializer(hazards, many=True).data)

    def post(self, request, assessment_pk):
        assessment = self._get_assessment(request, assessment_pk)
        serializer = HazardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        hazard = serializer.save(assessment=assessment)
        return Response(HazardSerializer(hazard).data, status=status.HTTP_201_CREATED)


class HazardDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_hazard(self, request, assessment_pk, hazard_pk):
        return get_object_or_404(
            Hazard,
            pk=hazard_pk,
            assessment__pk=assessment_pk,
            assessment__organization_id=request.user.organization_id,
            assessment__is_deleted=False,
        )

    def patch(self, request, assessment_pk, hazard_pk):
        hazard = self._get_hazard(request, assessment_pk, hazard_pk)
        serializer = HazardSerializer(hazard, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(HazardSerializer(hazard).data)

    def delete(self, request, assessment_pk, hazard_pk):
        hazard = self._get_hazard(request, assessment_pk, hazard_pk)
        hazard.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
