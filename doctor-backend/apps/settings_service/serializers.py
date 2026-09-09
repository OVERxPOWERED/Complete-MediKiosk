from rest_framework import serializers
from .models import DoctorSettings, NoteTemplate

class NoteTemplateSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='template_id')

    class Meta:
        model = NoteTemplate
        fields = ['id', 'title', 'category', 'content', 'shortcut', 'order']

class DoctorSettingsSerializer(serializers.ModelSerializer):
    showAyushDefault = serializers.BooleanField(source='show_ayush_default')
    pinnedSpecialists = serializers.JSONField(source='pinned_specialists')
    autoOpenDocs = serializers.BooleanField(source='auto_open_docs')
    highlightAbnormalVitals = serializers.BooleanField(source='highlight_abnormal_vitals')
    confirmBeforePush = serializers.BooleanField(source='confirm_before_push')

    class Meta:
        model = DoctorSettings
        fields = [
            'showAyushDefault',
            'pinnedSpecialists',
            'autoOpenDocs',
            'highlightAbnormalVitals',
            'confirmBeforePush',
        ]
