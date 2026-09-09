from django.urls import path
from .views import (
    DoctorSettingsDetailView,
    NoteTemplateListView,
    NoteTemplateDetailView,
)

urlpatterns = [
    path('settings/', DoctorSettingsDetailView.as_view(), name='doctor-settings'),
    path('settings/templates/', NoteTemplateListView.as_view(), name='note-templates-list'),
    path('settings/templates/<str:template_id>/', NoteTemplateDetailView.as_view(), name='note-template-detail'),
]
