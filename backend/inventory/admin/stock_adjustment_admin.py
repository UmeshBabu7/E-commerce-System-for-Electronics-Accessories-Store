from django.contrib import admin
from inventory.models import StockAdjustment


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "adjustment_type",
        "quantity",
        "previous_stock",
        "new_stock",
        "performed_by",
        "created_at",
    )
    list_filter = ("adjustment_type",)
    search_fields = ("product__name", "product__sku", "performed_by__email")
    ordering = ("-created_at",)
    readonly_fields = ("previous_stock", "new_stock", "created_at")

    fieldsets = (
        (
            "Adjustment Info",
            {"fields": ("product", "adjustment_type", "quantity", "notes")},
        ),
        ("Stock Snapshot", {"fields": ("previous_stock", "new_stock")}),
        ("Meta", {"fields": ("performed_by", "created_at"), "classes": ("collapse",)}),
    )
