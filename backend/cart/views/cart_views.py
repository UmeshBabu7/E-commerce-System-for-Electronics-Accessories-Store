from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsCustomer

from cart.models import Cart, CartItem
from cart.serializers import CartSerializer, AddToCartSerializer
from products.models import Product, ProductVariation


class CartView(APIView):
    permission_classes = [IsCustomer]

    def get_or_create_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                product = Product.objects.get(pk=data["product_id"], is_active=True)
            except Product.DoesNotExist:
                return Response(
                    {"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND
                )

            variation = None
            if data.get("variation_id"):
                try:
                    variation = ProductVariation.objects.get(
                        pk=data["variation_id"], product=product
                    )
                except ProductVariation.DoesNotExist:
                    return Response(
                        {"detail": "Variation not found."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

            available = variation.stock_level if variation else product.stock_level
            if available < data["quantity"]:
                return Response(
                    {"detail": f"Only {available} items available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cart = self.get_or_create_cart(request.user)
            item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                variation=variation,
                defaults={"quantity": data["quantity"]},
            )
            if not created:
                item.quantity += data["quantity"]
                item.save()

            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        cart = self.get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response({"detail": "Cart cleared."})
