from django.contrib import admin
from orders.models import OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product_name",
        "product_sku",
        "unit_price",
        "cost_price",
        "subtotal",
        "profit",
    )
    fields = (
        "product",
        "variation",
        "product_name",
        "product_sku",
        "quantity",
        "unit_price",
        "cost_price",
        "subtotal",
        "profit",
    )
