from django.urls import path
from orders.views import AllOrderListView, OrderStatusUpdateView

urlpatterns = [
    path("all/", AllOrderListView.as_view(), name="all_orders"),
    path(
        "<int:pk>/status/", OrderStatusUpdateView.as_view(), name="update_order_status"
    ),
]
