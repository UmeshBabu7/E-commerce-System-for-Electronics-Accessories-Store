from rest_framework import serializers
from products.models import Product, Category
from .category_serializer import CategorySerializer
from .product_variation_serializer import ProductVariationSerializer


class ProductSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Category.objects.all(), write_only=True, source="categories"
    )
    variations = ProductVariationSerializer(many=True, read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "name",
            "description",
            "categories",
            "category_ids",
            "variations",
            "cost_price",
            "selling_price",
            "stock_level",
            "reorder_point",
            "image",
            "is_active",
            "is_low_stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProductListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    variations = ProductVariationSerializer(many=True, read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "name",
            "categories",
            "variations",
            "cost_price",
            "selling_price",
            "stock_level",
            "reorder_point",
            "is_low_stock",
            "image",
            "is_active",
        ]


class CustomerProductSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    variations = ProductVariationSerializer(many=True, read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "name",
            "description",
            "categories",
            "variations",
            "selling_price",
            "stock_level",
            "reorder_point",
            "is_low_stock",
            "image",
            "is_active",
        ]
