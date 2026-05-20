from rest_framework.permissions import BasePermission


class IsCitizen(BasePermission):
    """Hanya user yang login DAN bukan staff/admin yang bisa create laporan."""
    message = "Hanya warga (Citizen) yang dapat membuat laporan."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            not request.user.is_staff
        )


class IsOwnerAndDraft(BasePermission):
    """Edit dan Delete hanya oleh pemilik laporan DAN status masih DRAFT."""
    message = "Hanya pemilik laporan dengan status DRAFT yang dapat mengubah atau menghapus laporan."

    def has_object_permission(self, request, view, obj):
        return bool(
            obj.reporter == request.user and
            obj.status == 'DRAFT'
        )
