from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer, PlaceOrderSerializer
from cart.models import Cart
from inventory.models import StockAdjustment


class PlaceOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        if serializer.is_valid():
            try:
                cart = Cart.objects.prefetch_related(
                    "items__product", "items__variation"
                ).get(user=request.user)
            except Cart.DoesNotExist:
                return Response(
                    {"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST
                )

            cart_items = cart.items.all()
            if not cart_items.exists():
                return Response(
                    {"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST
                )

            for item in cart_items:
                available = (
                    item.variation.stock_level
                    if item.variation
                    else item.product.stock_level
                )
                if available < item.quantity:
                    return Response(
                        {"detail": f"Insufficient stock for {item.product.name}."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            total = sum(item.total_price for item in cart_items)
            order = Order.objects.create(
                user=request.user, total_amount=total, **serializer.validated_data
            )

            for item in cart_items:
                unit_price = item.unit_price
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    variation=item.variation,
                    product_name=item.product.name,
                    product_sku=item.product.sku,
                    quantity=item.quantity,
                    unit_price=unit_price,
                    cost_price=item.product.cost_price,
                )

                prev = item.product.stock_level
                item.product.stock_level -= item.quantity
                item.product.save()
                StockAdjustment.objects.create(
                    product=item.product,
                    adjustment_type="sale",
                    quantity=-item.quantity,
                    previous_stock=prev,
                    new_stock=item.product.stock_level,
                    notes=f"Order #{order.id}",
                    performed_by=request.user,
                )

            cart.items.all().delete()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
