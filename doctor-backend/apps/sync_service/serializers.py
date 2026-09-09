from rest_framework import serializers
from .models import SyncActionItem

class SyncActionItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='action_id')

    class Meta:
        model = SyncActionItem
        fields = [
            'id',
            'patient_token',
            'uhid',
            'action_type',
            'timestamp',
            'status',
            'details',
        ]
