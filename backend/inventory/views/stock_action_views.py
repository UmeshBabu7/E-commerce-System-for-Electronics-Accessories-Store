from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from inventory.models import StockAdjustment
from inventory.serializers import ReceiveStockSerializer, AdjustStockSerializer
from products.models import Product
from accounts.permissions import IsStaffOrAdmin


class ReceiveStockView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        serializer = ReceiveStockSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                product = Product.objects.get(pk=data["product_id"])
            except Product.DoesNotExist:
                return Response(
                    {"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND
                )

            prev_stock = product.stock_level
            product.stock_level += data["quantity"]
            product.save()

            StockAdjustment.objects.create(
                product=product,
                adjustment_type="receive",
                quantity=data["quantity"],
                previous_stock=prev_stock,
                new_stock=product.stock_level,
                notes=data.get("notes", ""),
                performed_by=request.user,
            )
            return Response(
                {"detail": f"Stock received. New level: {product.stock_level}"}
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdjustStockView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        serializer = AdjustStockSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                product = Product.objects.get(pk=data["product_id"])
            except Product.DoesNotExist:
                return Response(
                    {"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND
                )

            prev_stock = product.stock_level
            new_stock = prev_stock + data["quantity"]
            if new_stock < 0:
                return Response(
                    {"detail": "Insufficient stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            product.stock_level = new_stock
            product.save()

            StockAdjustment.objects.create(
                product=product,
                adjustment_type=data["adjustment_type"],
                quantity=data["quantity"],
                previous_stock=prev_stock,
                new_stock=new_stock,
                notes=data.get("notes", ""),
                performed_by=request.user,
            )
            return Response({"detail": f"Stock adjusted. New level: {new_stock}"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
