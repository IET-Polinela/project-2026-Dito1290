from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer

# ===== [TAMBAHAN LAB 14] Import utils untuk mempercantik dokumentasi =====
from drf_spectacular.utils import extend_schema

User = get_user_model()


@extend_schema(
    tags=['🔐 Autentikasi & Akun Warga'],
    summary="Registrasi akun Citizen baru",
    description="Endpoint ini digunakan untuk mendaftarkan akun warga (Citizen) baru ke dalam sistem portal Smart City."
)
class RegisterView(generics.CreateAPIView):
    """
    Endpoint registrasi Citizen baru.
    Tidak memerlukan login (AllowAny).
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]