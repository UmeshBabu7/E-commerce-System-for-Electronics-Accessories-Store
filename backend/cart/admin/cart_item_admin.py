from django.contrib import admin
from cart.models import CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("unit_price", "total_price", "added_at")
    fields = (
        "product",
        "variation",
        "quantity",
        "unit_price",
        "total_price",
        "added_at",
    )
