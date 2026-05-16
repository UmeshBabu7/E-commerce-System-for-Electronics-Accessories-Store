from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from orders.models import Order
from orders.serializers import OrderSerializer, UpdateOrderStatusSerializer
from accounts.permissions import IsStaffOrAdmin

from django.db import transaction
from inventory.models import StockAdjustment


class AllOrderListView(generics.ListAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = OrderSerializer

    def get_queryset(self):
        qs = (
            Order.objects.select_related("user")
            .prefetch_related("items")
            .order_by("-created_at")
        )
        order_status = self.request.query_params.get("status")
        if order_status:
            qs = qs.filter(status=order_status)
        return qs


class OrderStatusUpdateView(APIView):
    permission_classes = [IsStaffOrAdmin]

    @transaction.atomic
    def patch(self, request, pk):
        serializer = UpdateOrderStatusSerializer(data=request.data)
        if serializer.is_valid():
            try:
                order = Order.objects.prefetch_related(
                    "items__product", "items__variation"
                ).get(pk=pk)
            except Order.DoesNotExist:
                return Response(
                    {"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND
                )
            new_status = serializer.validated_data["status"]
            if new_status == "cancelled" and order.status != "cancelled":
                for item in order.items.all():
                    if item.variation:
                        prev = item.variation.stock_level
                        item.variation.stock_level += item.quantity
                        item.variation.save()
                        StockAdjustment.objects.create(
                            product=item.product,
                            adjustment_type="adjustment",
                            quantity=item.quantity,
                            previous_stock=prev,
                            new_stock=item.variation.stock_level,
                            notes=f"Order #{order.id} cancelled",
                            performed_by=request.user,
                        )
                    else:
                        prev = item.product.stock_level
                        item.product.stock_level += item.quantity
                        item.product.save()
                        StockAdjustment.objects.create(
                            product=item.product,
                            adjustment_type="adjustment",
                            quantity=item.quantity,
                            previous_stock=prev,
                            new_stock=item.product.stock_level,
                            notes=f"Order #{order.id} cancelled",
                            performed_by=request.user,
                        )
            order.status = new_status
            order.save()
            return Response(OrderSerializer(order).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
