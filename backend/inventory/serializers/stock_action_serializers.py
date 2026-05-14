from rest_framework import serializers


class ReceiveStockSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)


class AdjustStockSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField()
    adjustment_type = serializers.ChoiceField(
        choices=["adjustment", "damage", "return"]
    )
    notes = serializers.CharField(required=False, allow_blank=True)
