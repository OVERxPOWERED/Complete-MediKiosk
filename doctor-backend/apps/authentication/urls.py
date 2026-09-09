from django.urls import path
from .views import (
    HprLoginView,
    OtpVerifyView,
    DoctorProfileView,
    WorkspaceListView,
    SwitchWorkspaceView,
)

urlpatterns = [
    path('hpr-login/', HprLoginView.as_view(), name='hpr-login'),
    path('verify-otp/', OtpVerifyView.as_view(), name='verify-otp'),
    path('profile/', DoctorProfileView.as_view(), name='profile'),
    path('workspaces/', WorkspaceListView.as_view(), name='workspaces'),
    path('switch-workspace/', SwitchWorkspaceView.as_view(), name='switch-workspace'),
]
