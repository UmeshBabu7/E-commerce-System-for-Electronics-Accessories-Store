from django.urls import path, include

urlpatterns = [
    path("", include("orders.urls.order_urls")),
    path("", include("orders.urls.customer_urls")),
    path("", include("orders.urls.admin_urls")),
]
