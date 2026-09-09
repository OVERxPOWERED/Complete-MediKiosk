from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import DoctorProfile, Workspace
from .serializers import (
    DoctorProfileSerializer,
    WorkspaceSerializer,
    HprLoginSerializer,
    OtpVerifySerializer,
)

class HprLoginView(APIView):
    def post(self, request):
        serializer = HprLoginSerializer(data=request.data)
        if serializer.is_valid():
            hpr_id = serializer.validated_data['hpr_id']
            # Find or default doctor profile
            profile = DoctorProfile.objects.filter(hpr_id=hpr_id).first()
            masked_phone = "+91 ******4219"
            if profile and len(profile.phone) >= 4:
                masked_phone = f"+91 ******{profile.phone[-4:]}"
            
            return Response({
                "success": True,
                "message": f"OTP successfully sent to registered mobile {masked_phone}",
                "hpr_id": hpr_id,
                "expires_in": 180,
                "resend_in": 24,
                "demo_otp": "4219",
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OtpVerifyView(APIView):
    def post(self, request):
        serializer = OtpVerifySerializer(data=request.data)
        if serializer.is_valid():
            hpr_id = serializer.validated_data['hpr_id']
            otp = serializer.validated_data['otp']

            # Accept 4219 or any 6-digit OTP for testing
            if otp in ['4219', '123456', '000000'] or len(otp) == 6:
                profile = DoctorProfile.objects.filter(hpr_id=hpr_id).first()
                if not profile:
                    profile = DoctorProfile.objects.first()
                
                profile_data = DoctorProfileSerializer(profile).data if profile else {}
                return Response({
                    "success": True,
                    "token": f"medikiosk_token_{hpr_id}_{otp}",
                    "doctor": profile_data,
                    "message": "Authentication successful. Welcome Dr. Anjali Verma.",
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "success": False,
                    "error": "Invalid OTP. Please check your verification code.",
                }, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DoctorProfileView(APIView):
    def get(self, request):
        profile = DoctorProfile.objects.first()
        if not profile:
            profile = DoctorProfile.objects.create(
                hpr_id='HPR123456',
                name='Dr. Anjali Verma',
                degrees='MBBS, MD (Internal Medicine)',
                designation='Consultant – General Medicine',
                department='General Medicine OPD',
                hospital='District Hospital, Bhopal',
                counter_desk='Desk 4',
                timings='09:00 AM – 04:00 PM',
                email='anjali.verma@bhopalhosp.gov.in',
                phone='+91 98765 43210',
                is_verified_abdm=True,
                status='Active',
            )
        serializer = DoctorProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

class WorkspaceListView(APIView):
    def get(self, request):
        workspaces = Workspace.objects.filter(is_active=True)
        if not workspaces.exists():
            Workspace.objects.create(department='General Medicine OPD', desk='Desk 4', hospital='District Hospital, Bhopal')
            Workspace.objects.create(department='General Medicine OPD', desk='Desk 2', hospital='District Hospital, Bhopal')
            Workspace.objects.create(department='Cardiology OPD', desk='Desk 1', hospital='District Hospital, Bhopal')
            Workspace.objects.create(department='AYUSH / Panchakarma OPD', desk='Desk 3', hospital='District Hospital, Bhopal')
            workspaces = Workspace.objects.filter(is_active=True)
        serializer = WorkspaceSerializer(workspaces, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SwitchWorkspaceView(APIView):
    def post(self, request):
        department = request.data.get('department', 'General Medicine OPD')
        desk = request.data.get('desk', 'Desk 4')
        profile = DoctorProfile.objects.first()
        if profile:
            profile.department = department
            profile.counter_desk = desk
            profile.save()
        return Response({
            "success": True,
            "department": department,
            "desk": desk,
            "message": f"Workspace switched to {department} · {desk}",
        }, status=status.HTTP_200_OK)
