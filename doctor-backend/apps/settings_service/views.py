from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import DoctorSettings, NoteTemplate
from .serializers import DoctorSettingsSerializer, NoteTemplateSerializer

class DoctorSettingsDetailView(APIView):
    def get(self, request):
        settings_obj = DoctorSettings.objects.first()
        if not settings_obj:
            settings_obj = DoctorSettings.objects.create(
                doctor_hpr='HPR123456',
                show_ayush_default=True,
                pinned_specialists=['Cardiology', 'Neurology', 'Orthopedics', 'Endocrinology'],
                auto_open_docs=True,
                highlight_abnormal_vitals=True,
                confirm_before_push=True,
            )
        serializer = DoctorSettingsSerializer(settings_obj)
        templates = NoteTemplate.objects.all()
        return Response({
            "settings": serializer.data,
            "templates": NoteTemplateSerializer(templates, many=True).data,
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        settings_obj = DoctorSettings.objects.first()
        if not settings_obj:
            settings_obj = DoctorSettings.objects.create()

        data = request.data
        if 'showAyushDefault' in data:
            settings_obj.show_ayush_default = data['showAyushDefault']
        if 'pinnedSpecialists' in data:
            settings_obj.pinned_specialists = data['pinnedSpecialists']
        if 'autoOpenDocs' in data:
            settings_obj.auto_open_docs = data['autoOpenDocs']
        if 'highlightAbnormalVitals' in data:
            settings_obj.highlight_abnormal_vitals = data['highlightAbnormalVitals']
        if 'confirmBeforePush' in data:
            settings_obj.confirm_before_push = data['confirmBeforePush']

        settings_obj.save()
        return Response({
            "success": True,
            "settings": DoctorSettingsSerializer(settings_obj).data,
            "message": "Preferences saved successfully.",
        }, status=status.HTTP_200_OK)

class NoteTemplateListView(APIView):
    def get(self, request):
        templates = NoteTemplate.objects.all()
        serializer = NoteTemplateSerializer(templates, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        template_id = data.get('id') or f"tpl-{NoteTemplate.objects.count() + 1}"
        title = data.get('title', 'New Template')
        category = data.get('category', 'General Medicine')
        content = data.get('content', '')
        shortcut = data.get('shortcut', '')

        template, created = NoteTemplate.objects.update_or_create(
            template_id=template_id,
            defaults={
                'title': title,
                'category': category,
                'content': content,
                'shortcut': shortcut,
            }
        )
        return Response({
            "success": True,
            "template": NoteTemplateSerializer(template).data,
            "message": "Template saved successfully.",
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class NoteTemplateDetailView(APIView):
    def delete(self, request, template_id):
        template = NoteTemplate.objects.filter(template_id=template_id).first()
        if not template:
            return Response({"error": "Template not found"}, status=status.HTTP_404_NOT_FOUND)
        template.delete()
        return Response({"success": True, "message": "Template deleted."}, status=status.HTTP_200_OK)
