"""
URL configuration for medikiosk_backend project.
MediKiosk Doctor Interface - SIH 2026 Problem Statement SIH26047
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1 Endpoints
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/doctor/', include('apps.patients.urls')),
    path('api/v1/', include('apps.patients.urls')),
    path('api/v1/', include('apps.consultations.urls')),
    path('api/v1/', include('apps.settings_service.urls')),
    path('api/v1/', include('apps.sync_service.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
