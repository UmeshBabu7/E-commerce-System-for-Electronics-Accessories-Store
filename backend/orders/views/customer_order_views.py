from rest_framework import generics
from accounts.permissions import IsCustomer

from orders.models import Order
from orders.serializers import OrderSerializer


class CustomerOrderListView(generics.ListAPIView):
    permission_classes = [IsCustomer]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class CustomerOrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsCustomer]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")
