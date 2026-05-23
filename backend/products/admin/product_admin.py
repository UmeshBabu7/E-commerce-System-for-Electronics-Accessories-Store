from django.contrib import admin
from products.models import Product
from .product_variation_admin import ProductVariationInline


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "sku",
        "name",
        "selling_price",
        "stock_level",
        "is_low_stock",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "categories")
    search_fields = ("sku", "name", "description")
    ordering = ("-created_at",)
    filter_horizontal = ("categories",)
    readonly_fields = ("created_at", "updated_at")
    inlines = [ProductVariationInline]

    fieldsets = (
        (
            "Basic Info",
            {"fields": ("sku", "name", "description", "image", "is_active")},
        ),
        ("Pricing", {"fields": ("cost_price", "selling_price")}),
        ("Stock", {"fields": ("stock_level", "reorder_point")}),
        ("Categories", {"fields": ("categories",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
