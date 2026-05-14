from django.urls import path
from products.views import ProductVariationListCreateView, ProductVariationDetailView

urlpatterns = [
    path(
        "<int:product_id>/variations/",
        ProductVariationListCreateView.as_view(),
        name="variation_list_create",
    ),
    path(
        "<int:product_id>/variations/<int:pk>/",
        ProductVariationDetailView.as_view(),
        name="variation_detail",
    ),
]
