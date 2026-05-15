from django.contrib import admin
from cart.models import Cart
from .cart_item_admin import CartItemInline


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "total_items", "subtotal", "created_at", "updated_at")
    search_fields = ("user__email", "user__username")
    ordering = ("-updated_at",)
    readonly_fields = ("total_items", "subtotal", "created_at", "updated_at")
    inlines = [CartItemInline]

    fieldsets = (
        ("Cart Info", {"fields": ("user", "total_items", "subtotal")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
