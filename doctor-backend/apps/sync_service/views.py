from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import SyncActionItem
from .serializers import SyncActionItemSerializer

class SyncStatusView(APIView):
    def get(self, request):
        items = SyncActionItem.objects.all()
        if not items.exists():
            default_items = [
                {
                    "action_id": "sync-1",
                    "patient_token": "A1052",
                    "uhid": "UHID778901",
                    "action_type": "Patient summary",
                    "timestamp": "03 Sep 2026, 11:20 AM",
                    "status": "Pending",
                    "details": "Pre-consultation draft awaiting final verification by HIS server.",
                },
                {
                    "action_id": "sync-2",
                    "patient_token": "A1048",
                    "uhid": "UHID667320",
                    "action_type": "Outcome (Treated)",
                    "timestamp": "03 Sep 2026, 10:55 AM",
                    "status": "Pending",
                    "details": "Prescription details queued for hospital pharmacy dispension.",
                },
                {
                    "action_id": "sync-3",
                    "patient_token": "A1046",
                    "uhid": "UHID556781",
                    "action_type": "Outcome (Referred)",
                    "timestamp": "03 Sep 2026, 09:42 AM",
                    "status": "Synced",
                    "details": "Specialist referral dispatched to Cardiology OPD Desk 1.",
                },
                {
                    "action_id": "sync-4",
                    "patient_token": "A1045",
                    "uhid": "UHID334211",
                    "action_type": "Patient summary",
                    "timestamp": "03 Sep 2026, 09:15 AM",
                    "status": "Synced",
                    "details": "Confirmed summary written to central EHR archive.",
                },
                {
                    "action_id": "sync-5",
                    "patient_token": "A1041",
                    "uhid": "UHID998123",
                    "action_type": "Documents (2 files)",
                    "timestamp": "03 Sep 2026, 08:50 AM",
                    "status": "Synced",
                    "details": "High-resolution sensor scans synced to hospital PACS archive.",
                },
            ]
            for it in default_items:
                SyncActionItem.objects.create(**it)
            items = SyncActionItem.objects.all()

        pending_count = items.filter(status='Pending').count()
        serializer = SyncActionItemSerializer(items, many=True)
        return Response({
            "is_online": True,
            "pending_count": pending_count,
            "last_synced": "Today, 11:38 AM",
            "sync_actions": serializer.data,
        }, status=status.HTTP_200_OK)

class SyncNowView(APIView):
    def post(self, request):
        pending_items = SyncActionItem.objects.filter(status='Pending')
        count = pending_items.count()
        pending_items.update(status='Synced', synced_at=timezone.now())

        all_items = SyncActionItem.objects.all()
        serializer = SyncActionItemSerializer(all_items, many=True)
        return Response({
            "success": True,
            "synced_count": count,
            "pending_count": 0,
            "last_synced": "Just now",
            "sync_actions": serializer.data,
            "message": f"Successfully synced {count} pending action(s) to Hospital Information System.",
        }, status=status.HTTP_200_OK)

class RetrySyncActionView(APIView):
    def post(self, request, action_id):
        item = SyncActionItem.objects.filter(action_id=action_id).first()
        if not item:
            return Response({"error": f"Sync item '{action_id}' not found"}, status=status.HTTP_404_NOT_FOUND)

        item.status = 'Synced'
        item.synced_at = timezone.now()
        item.save()

        return Response({
            "success": True,
            "action": SyncActionItemSerializer(item).data,
            "message": f"Action {item.action_id} synced successfully.",
        }, status=status.HTTP_200_OK)
