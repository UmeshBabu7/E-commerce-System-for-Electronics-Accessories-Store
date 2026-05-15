from django.contrib import admin
from orders.models import Order
from .order_item_admin import OrderItemInline


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "total_amount", "phone", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email", "user__username", "phone")
    ordering = ("-created_at",)
    readonly_fields = ("total_amount", "created_at", "updated_at")
    inlines = [OrderItemInline]

    fieldsets = (
        ("Order Info", {"fields": ("user", "status", "total_amount")}),
        ("Shipping", {"fields": ("shipping_address", "phone", "notes")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
