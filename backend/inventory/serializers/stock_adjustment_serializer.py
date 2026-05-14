from rest_framework import serializers
from inventory.models import StockAdjustment


class StockAdjustmentSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    performed_by_name = serializers.CharField(
        source="performed_by.username", read_only=True
    )

    class Meta:
        model = StockAdjustment
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "adjustment_type",
            "quantity",
            "previous_stock",
            "new_stock",
            "notes",
            "performed_by",
            "performed_by_name",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "previous_stock",
            "new_stock",
            "performed_by",
            "created_at",
        ]
