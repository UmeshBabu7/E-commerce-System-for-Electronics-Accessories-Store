from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from django.db.models import F, Sum, Count
from products.models import Product
from products.serializers import ProductListSerializer
from accounts.permissions import IsStaffOrAdmin


class LowStockView(generics.ListAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = ProductListSerializer

    def get_queryset(self):
        return Product.objects.filter(
            stock_level__lte=F("reorder_point"), is_active=True
        ).order_by("stock_level")


class InventoryOverviewView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        products = Product.objects.filter(is_active=True)
        total_products = products.count()
        total_stock_value = sum(p.stock_level * p.cost_price for p in products)
        low_stock_count = products.filter(stock_level__lte=F("reorder_point")).count()
        out_of_stock_count = products.filter(stock_level=0).count()

        return Response(
            {
                "total_products": total_products,
                "total_stock_value": total_stock_value,
                "low_stock_count": low_stock_count,
                "out_of_stock_count": out_of_stock_count,
            }
        )
