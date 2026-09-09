from django.urls import path
from .views import SyncStatusView, SyncNowView, RetrySyncActionView

urlpatterns = [
    path('sync/status/', SyncStatusView.as_view(), name='sync-status'),
    path('sync/now/', SyncNowView.as_view(), name='sync-now'),
    path('sync/retry/<str:action_id>/', RetrySyncActionView.as_view(), name='sync-retry'),
]
