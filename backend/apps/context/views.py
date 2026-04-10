from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ManagementSystemScope, InterestedParty, ContextIssue, RiskOrOpportunity
from .serializers import (
    ManagementSystemScopeSerializer,
    InterestedPartySerializer,
    ContextIssueListSerializer,
    ContextIssueDetailSerializer,
    ContextIssueWriteSerializer,
    RiskOrOpportunityListSerializer,
    RiskOrOpportunityDetailSerializer,
    RiskOrOpportunityWriteSerializer,
)
from .services import ContextService


# ─── Management System Scope (Clause 4.3) ────────────────────────────────────

class ManagementSystemScopeView(APIView):
    """GET returns the org's scope (null if not yet defined). PUT upserts it."""

    def get(self, request):
        try:
            scope = ManagementSystemScope.objects.get(organization=request.user.organization)
            return Response(ManagementSystemScopeSerializer(scope).data)
        except ManagementSystemScope.DoesNotExist:
            return Response(None)

    def put(self, request):
        try:
            scope = ManagementSystemScope.objects.get(organization=request.user.organization)
            serializer = ManagementSystemScopeSerializer(scope, data=request.data, partial=True)
        except ManagementSystemScope.DoesNotExist:
            serializer = ManagementSystemScopeSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save(organization=request.user.organization, updated_by=request.user)
        return Response(serializer.data)


# ─── Interested Parties ───────────────────────────────────────────────────────

class InterestedPartyListView(generics.ListCreateAPIView):
    serializer_class = InterestedPartySerializer
    pagination_class = None

    def get_queryset(self):
        return InterestedParty.objects.filter(organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class InterestedPartyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InterestedPartySerializer
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return InterestedParty.objects.filter(organization=self.request.user.organization)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = InterestedParty.Status.INACTIVE
        instance.save(update_fields=['status'])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Context Issues ───────────────────────────────────────────────────────────

class ContextIssueListView(generics.ListCreateAPIView):
    pagination_class = None

    def get_queryset(self):
        qs = ContextIssue.objects.filter(organization=self.request.user.organization)
        classification = self.request.query_params.get('classification')
        issue_type = self.request.query_params.get('type')
        issue_status = self.request.query_params.get('status')
        if classification:
            qs = qs.filter(classification=classification)
        if issue_type:
            qs = qs.filter(type=issue_type)
        if issue_status:
            qs = qs.filter(status=issue_status)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ContextIssueWriteSerializer
        return ContextIssueListSerializer

    def create(self, request, *args, **kwargs):
        serializer = ContextIssueWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        issue = serializer.save(
            organization=request.user.organization,
            identified_by=request.user if not serializer.validated_data.get('identified_by') else serializer.validated_data['identified_by'],
        )
        return Response(ContextIssueDetailSerializer(issue).data, status=status.HTTP_201_CREATED)


class ContextIssueDetailView(generics.RetrieveUpdateDestroyAPIView):
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return ContextIssue.objects.filter(organization=self.request.user.organization)

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return ContextIssueWriteSerializer
        return ContextIssueDetailSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = ContextIssue.Status.CLOSED
        instance.save(update_fields=['status'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ContextIssueWriteSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        issue = serializer.save()
        return Response(ContextIssueDetailSerializer(issue).data)


class ContextIssueStatsView(APIView):
    def get(self, request):
        stats = ContextService.get_issue_stats(request.user.organization_id)
        return Response(stats)


# ─── Risks & Opportunities ────────────────────────────────────────────────────

class RiskOpportunityListView(generics.ListCreateAPIView):
    pagination_class = None

    def get_queryset(self):
        qs = RiskOrOpportunity.objects.filter(organization=self.request.user.organization)
        ro_type = self.request.query_params.get('type')
        ro_status = self.request.query_params.get('status')
        if ro_type:
            qs = qs.filter(type=ro_type)
        if ro_status:
            qs = qs.filter(status=ro_status)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RiskOrOpportunityWriteSerializer
        return RiskOrOpportunityListSerializer

    def create(self, request, *args, **kwargs):
        serializer = RiskOrOpportunityWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ro = serializer.save(organization=request.user.organization)
        return Response(RiskOrOpportunityDetailSerializer(ro).data, status=status.HTTP_201_CREATED)


class RiskOpportunityDetailView(generics.RetrieveUpdateDestroyAPIView):
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return RiskOrOpportunity.objects.filter(organization=self.request.user.organization)

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return RiskOrOpportunityWriteSerializer
        return RiskOrOpportunityDetailSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = RiskOrOpportunity.Status.CLOSED
        instance.save(update_fields=['status'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = RiskOrOpportunityWriteSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        ro = serializer.save()
        return Response(RiskOrOpportunityDetailSerializer(ro).data)


class RiskOpportunityStatsView(APIView):
    def get(self, request):
        stats = ContextService.get_ro_stats(request.user.organization_id)
        return Response(stats)
