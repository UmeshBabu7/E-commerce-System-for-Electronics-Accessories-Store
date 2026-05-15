from rest_framework import serializers
from orders.models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "variation",
            "quantity",
            "unit_price",
            "subtotal",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "user_email",
            "user_name",
            "status",
            "shipping_address",
            "phone",
            "notes",
            "total_amount",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "total_amount", "created_at", "updated_at"]
