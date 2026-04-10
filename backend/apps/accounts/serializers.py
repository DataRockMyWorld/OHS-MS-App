from rest_framework import serializers
from apps.core.models import Department
from .models import User, UserRole, Notification


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


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']


class UserDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(
        source='department.name', read_only=True, default=None
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'job_title', 'phone',
            'department', 'department_name',
            'is_active', 'date_joined',
        ]
        read_only_fields = ['id', 'email', 'full_name', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class UserInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.EMPLOYEE)
    job_title = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    department = serializers.UUIDField(required=False, allow_null=True, default=None)


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'role', 'job_title', 'phone', 'department']


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'body', 'link',
            'is_read', 'created_at',
        ]
        read_only_fields = fields
