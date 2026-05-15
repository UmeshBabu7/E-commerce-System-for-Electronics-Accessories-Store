from django.urls import path
from orders.views import CustomerOrderListView, CustomerOrderDetailView

urlpatterns = [
    path("my/", CustomerOrderListView.as_view(), name="my_orders"),
    path("my/<int:pk>/", CustomerOrderDetailView.as_view(), name="my_order_detail"),
]
