from django.urls import path
from .views import RecordOutcomeView, UndoOutcomeView, PatientAuditTrailView

urlpatterns = [
    path('consultations/<str:token>/outcome/', RecordOutcomeView.as_view(), name='record-outcome'),
    path('consultations/<str:token>/undo/', UndoOutcomeView.as_view(), name='undo-outcome'),
    path('patients/<str:token>/audit-trail/', PatientAuditTrailView.as_view(), name='patient-audit-trail'),
]
