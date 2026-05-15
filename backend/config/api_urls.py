from django.urls import path, include

urlpatterns = [
    path("api/auth/", include("accounts.urls")),
    path("api/products/", include("products.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/cart/", include("cart.urls")),
    path("api/orders/", include("orders.urls")),
]
