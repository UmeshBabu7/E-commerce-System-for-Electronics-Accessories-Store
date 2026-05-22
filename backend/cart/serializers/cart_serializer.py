from rest_framework import serializers
from cart.models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)
    variation_label = serializers.SerializerMethodField()
    unit_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    available_stock = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "product_image",
            "variation",
            "variation_label",
            "quantity",
            "unit_price",
            "total_price",
            "available_stock",
            "added_at",
        ]
        read_only_fields = ["id", "added_at"]

    def get_variation_label(self, obj):
        if obj.variation:
            return f"{obj.variation.attribute}: {obj.variation.value}"
        return None

    def get_available_stock(self, obj):
        if obj.variation:
            return obj.variation.stock_level
        return obj.product.stock_level


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "subtotal", "total_items", "updated_at"]
