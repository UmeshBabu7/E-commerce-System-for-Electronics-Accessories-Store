from rest_framework import serializers
from orders.models import Order


class PlaceOrderSerializer(serializers.Serializer):
    shipping_address = serializers.CharField()
    phone = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)


class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
