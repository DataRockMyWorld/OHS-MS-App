from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LegalRequirement, LegalComplianceReview
from .serializers import (
    LegalRequirementListSerializer,
    LegalRequirementDetailSerializer,
    LegalRequirementWriteSerializer,
    LegalComplianceReviewSerializer,
)


class LegalRequirementListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LegalRequirementWriteSerializer
        return LegalRequirementListSerializer

    def get_queryset(self):
        org_id = self.request.user.organization_id
        qs = LegalRequirement.objects.filter(
            organization_id=org_id, is_deleted=False
        ).select_related('department', 'responsible_person', 'last_reviewed_by')

        compliance_status = self.request.query_params.get('compliance_status')
        if compliance_status:
            qs = qs.filter(compliance_status=compliance_status)

        requirement_type = self.request.query_params.get('requirement_type')
        if requirement_type:
            qs = qs.filter(requirement_type=requirement_type)

        jurisdiction = self.request.query_params.get('jurisdiction')
        if jurisdiction:
            qs = qs.filter(jurisdiction=jurisdiction)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        req = serializer.save(
            organization=request.user.organization,
            created_by=request.user,
        )
        return Response(
            LegalRequirementDetailSerializer(req, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


class LegalRequirementDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LegalRequirement.objects.filter(
            organization_id=self.request.user.organization_id,
            is_deleted=False,
        ).select_related('department', 'responsible_person', 'last_reviewed_by').prefetch_related('reviews__reviewed_by')

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return LegalRequirementWriteSerializer
        return LegalRequirementDetailSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instance.refresh_from_db()
        return Response(
            LegalRequirementDetailSerializer(instance, context=self.get_serializer_context()).data
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])


class LegalComplianceReviewCreateView(APIView):
    """Record a compliance review for a legal requirement."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        requirement = get_object_or_404(
            LegalRequirement,
            pk=pk,
            organization_id=request.user.organization_id,
            is_deleted=False,
        )
        serializer = LegalComplianceReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(
            requirement=requirement,
            reviewed_by=request.user,
        )

        # Update the parent requirement's compliance status and last reviewed fields
        requirement.compliance_status = review.compliance_status
        requirement.last_reviewed_date = review.review_date
        requirement.last_reviewed_by = request.user
        if review.next_review_date:
            requirement.review_date = review.next_review_date
        requirement.save(update_fields=[
            'compliance_status', 'last_reviewed_date', 'last_reviewed_by', 'review_date'
        ])

        requirement.refresh_from_db()
        return Response(
            LegalRequirementDetailSerializer(requirement, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
