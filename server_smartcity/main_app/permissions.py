from rest_framework import permissions


class IsCitizen(permissions.BasePermission):
    """Hanya Citizen (bukan Admin/staff) yang bisa create laporan."""
    message = "Hanya warga (Citizen) yang dapat membuat laporan."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            not request.user.is_staff
        )


class IsOwnerAndDraftOrReadOnly(permissions.BasePermission):
    """Edit/Delete hanya pemilik laporan DAN status DRAFT."""
    message = "Hanya pemilik laporan dengan status DRAFT yang dapat mengubah atau menghapus laporan."

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.reporter == request.user and obj.status == 'DRAFT'
