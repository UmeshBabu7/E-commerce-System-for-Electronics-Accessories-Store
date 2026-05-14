from django.contrib import admin
from products.models import ProductVariation


class ProductVariationInline(admin.TabularInline):
    model = ProductVariation
    extra = 1
    fields = ("attribute", "value", "additional_price", "stock_level")
