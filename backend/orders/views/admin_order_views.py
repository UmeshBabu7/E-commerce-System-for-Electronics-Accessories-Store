from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from orders.models import Order
from orders.serializers import OrderSerializer, UpdateOrderStatusSerializer
from accounts.permissions import IsStaffOrAdmin


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

    def patch(self, request, pk):
        serializer = UpdateOrderStatusSerializer(data=request.data)
        if serializer.is_valid():
            try:
                order = Order.objects.get(pk=pk)
            except Order.DoesNotExist:
                return Response(
                    {"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND
                )
            order.status = serializer.validated_data["status"]
            order.save()
            return Response(OrderSerializer(order).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
