from rest_framework import serializers
from products.models import ProductVariation


class ProductVariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariation
        fields = ["id", "attribute", "value", "additional_price", "stock_level"]
