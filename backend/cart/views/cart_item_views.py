from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsCustomer

from cart.models import Cart, CartItem
from cart.serializers import CartSerializer, UpdateCartItemSerializer


class CartItemView(APIView):
    permission_classes = [IsCustomer]

    def patch(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        if serializer.is_valid():
            try:
                item = CartItem.objects.get(pk=item_id, cart__user=request.user)
            except CartItem.DoesNotExist:
                return Response(
                    {"detail": "Item not found."}, status=status.HTTP_404_NOT_FOUND
                )

            quantity = serializer.validated_data["quantity"]
            available = (
                item.variation.stock_level
                if item.variation
                else item.product.stock_level
            )
            if available < quantity:
                return Response(
                    {"detail": f"Only {available} available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            item.quantity = quantity
            item.save()
            cart = Cart.objects.get(user=request.user)
            return Response(CartSerializer(cart).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(pk=item_id, cart__user=request.user)
            item.delete()
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Item not found."}, status=status.HTTP_404_NOT_FOUND
            )
        cart = Cart.objects.get(user=request.user)
        return Response(CartSerializer(cart).data)
