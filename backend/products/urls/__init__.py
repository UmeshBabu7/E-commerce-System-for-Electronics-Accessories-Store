from django.urls import path, include

urlpatterns = [
    path("", include("products.urls.category_urls")),
    path("", include("products.urls.product_urls")),
    path("", include("products.urls.variation_urls")),
]
