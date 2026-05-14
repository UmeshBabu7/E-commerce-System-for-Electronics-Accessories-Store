from rest_framework import generics
from accounts.permissions import IsStaffOrAdmin
from products.models import Product, ProductVariation
from products.serializers import ProductVariationSerializer


class ProductVariationListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductVariationSerializer
    permission_classes = [IsStaffOrAdmin]

    def get_queryset(self):
        return ProductVariation.objects.filter(product_id=self.kwargs["product_id"])

    def perform_create(self, serializer):
        product = Product.objects.get(pk=self.kwargs["product_id"])
        serializer.save(product=product)


class ProductVariationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductVariationSerializer
    permission_classes = [IsStaffOrAdmin]

    def get_queryset(self):
        return ProductVariation.objects.filter(product_id=self.kwargs["product_id"])
