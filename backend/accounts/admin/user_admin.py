from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from accounts.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "role", "phone", "is_active", "created_at")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "username", "phone")
    ordering = ("-created_at",)
