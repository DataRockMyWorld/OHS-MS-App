from rest_framework import serializers

from .models import Objective, KPIMeasurement
from .services import ObjectiveService


class KPIMeasurementSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.SerializerMethodField()
    # objective is write-only — set from URL kwarg in view
    objective = serializers.PrimaryKeyRelatedField(
        queryset=Objective.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = KPIMeasurement
        fields = [
            'id',
            'objective',
            'value',
            'measured_at',
            'notes',
            'is_auto_computed',
            'recorded_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'recorded_by_name']

    def get_recorded_by_name(self, obj):
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.email
        return None


class ObjectiveListSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    achievement_pct = serializers.SerializerMethodField()

    class Meta:
        model = Objective
        fields = [
            'id',
            'title',
            'scope',
            'category',
            'unit',
            'direction',
            'measurement_frequency',
            'linked_metric',
            'baseline_value',
            'target_value',
            'current_value',
            'status',
            'start_date',
            'target_date',
            'owner_id',
            'owner_name',
            'weight',
            'achievement_pct',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'owner_name', 'achievement_pct']

    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name() or obj.owner.email
        return None

    def get_achievement_pct(self, obj):
        return ObjectiveService.get_achievement_pct(obj)


class ObjectiveDetailSerializer(ObjectiveListSerializer):
    measurements = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta(ObjectiveListSerializer.Meta):
        fields = ObjectiveListSerializer.Meta.fields + [
            'description',
            'created_by_name',
            'measurements',
        ]
        read_only_fields = ObjectiveListSerializer.Meta.read_only_fields + [
            'created_by_name',
            'measurements',
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None

    def get_measurements(self, obj):
        qs = obj.measurements.order_by('measured_at')[:12]
        return KPIMeasurementSerializer(qs, many=True).data
