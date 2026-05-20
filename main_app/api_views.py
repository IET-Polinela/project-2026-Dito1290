from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Report
from .serializers import ReportSerializer
from .permissions import IsCitizen, IsOwnerAndDraft


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def get_permissions(self):
        """
        - list, retrieve  → semua user yang sudah login
        - create          → hanya Citizen (bukan admin/staff)
        - update, destroy → pemilik laporan + status DRAFT
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        elif self.action == 'create':
            permission_classes = [IsCitizen]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsOwnerAndDraft]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Otomatis set reporter dari JWT token,
        bukan dari payload JSON yang dikirim frontend.
        """
        serializer.save(reporter=self.request.user)
