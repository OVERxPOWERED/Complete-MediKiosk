from django.urls import path
from .views import (
    QueueListView,
    ScanPatientView,
    PatientSummaryDetailView,
    ConfirmAndPushHisView,
    DocumentAnnotationView,
    FlagDocumentRescanView,
    PatientIntakeView,
)

urlpatterns = [
    path('queue/', QueueListView.as_view(), name='queue-list'),
    path('scan/', ScanPatientView.as_view(), name='scan-patient'),
    path('patients/intake/', PatientIntakeView.as_view(), name='patient-intake'),
    path('patients/<str:token>/summary/', PatientSummaryDetailView.as_view(), name='patient-summary'),
    path('patients/<str:token>/confirm-his/', ConfirmAndPushHisView.as_view(), name='confirm-his'),
    path('documents/<str:doc_id>/annotations/', DocumentAnnotationView.as_view(), name='document-annotation'),
    path('documents/<str:doc_id>/flag-rescan/', FlagDocumentRescanView.as_view(), name='flag-rescan'),
]
