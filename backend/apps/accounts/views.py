from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserMeSerializer, UserMinimalSerializer


class MeView(APIView):
    """Return the currently authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserMeSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class OrgUsersView(ListAPIView):
    """List all active users in the requesting user's organization."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserMinimalSerializer
    pagination_class = None  # Return plain array — picker needs all users at once

    def get_queryset(self):
        user = self.request.user
        if not user.organization_id:
            return User.objects.none()
        return User.objects.filter(
            organization_id=user.organization_id,
            is_active=True,
        ).order_by('first_name', 'last_name')
