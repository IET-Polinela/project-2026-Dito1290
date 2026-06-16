from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # Ini supaya kolom is_admin dan is_member muncul di daftar user
    list_display = ('username', 'email', 'is_admin', 'is_member', 'is_staff')
    
    # Ini supaya field tersebut bisa diedit saat klik nama user
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('is_admin', 'is_member')}),
    )

# Daftarkan model CustomUser dengan pengaturan di atas
admin.site.register(CustomUser, CustomUserAdmin)