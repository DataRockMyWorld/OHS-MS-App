from rest_framework import serializers
from .models import User


class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role', 'job_title']
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class UserMeSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    organization_name = serializers.CharField(
        source='organization.name', read_only=True, default=None
    )
    organization_id = serializers.UUIDField(
        source='organization.id', read_only=True, default=None
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'job_title', 'phone',
            'organization_id', 'organization_name',
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email
