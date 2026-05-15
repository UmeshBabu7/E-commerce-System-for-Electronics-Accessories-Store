from django.urls import path
from cart.views import CartView, CartItemView

urlpatterns = [
    path("", CartView.as_view(), name="cart"),
    path("items/<int:item_id>/", CartItemView.as_view(), name="cart_item"),
]
