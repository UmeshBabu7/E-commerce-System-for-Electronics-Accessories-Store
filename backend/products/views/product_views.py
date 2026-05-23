from rest_framework import generics, status, filters
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import F
from products.models import Product
from products.serializers import (
    ProductSerializer,
    ProductListSerializer,
    CustomerProductSerializer,
)
from accounts.permissions import IsStaffOrAdmin


class ProductListCreateView(generics.ListCreateAPIView):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "sku", "description"]
    ordering_fields = ["name", "selling_price", "stock_level", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Product.objects.prefetch_related("categories", "variations")
        category_id = self.request.query_params.get("category")
        in_stock = self.request.query_params.get("in_stock")
        low_stock = self.request.query_params.get("low_stock")
        is_active = self.request.query_params.get("is_active")

        user = self.request.user
        is_admin_or_staff = (
            user and user.is_authenticated and user.role in ["staff", "admin"]
        )

        if is_active == "true":
            queryset = queryset.filter(is_active=True)
        elif is_active == "false":
            queryset = queryset.filter(is_active=False)
        elif not is_admin_or_staff:
            queryset = queryset.filter(is_active=True)

        if category_id:
            queryset = queryset.filter(categories__id=category_id)
        if in_stock == "true":
            queryset = queryset.filter(stock_level__gt=0)
        if low_stock == "true":
            queryset = queryset.filter(stock_level__lte=F("reorder_point"))

        return queryset

    def get_serializer_class(self):
        if self.request.method != "GET":
            return ProductSerializer
        user = self.request.user
        if user and user.is_authenticated and user.role in ["staff", "admin"]:
            return ProductListSerializer
        return CustomerProductSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsStaffOrAdmin()]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.prefetch_related("categories", "variations")

    def get_serializer_class(self):
        if self.request.method != "GET":
            return ProductSerializer
        user = self.request.user
        if user and user.is_authenticated and user.role in ["staff", "admin"]:
            return ProductSerializer
        return CustomerProductSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsStaffOrAdmin()]

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        product.is_active = False
        product.save()
        return Response({"detail": "Product deactivated."}, status=status.HTTP_200_OK)
