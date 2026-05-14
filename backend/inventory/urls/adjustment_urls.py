from django.urls import path
from inventory.views import StockAdjustmentListView

urlpatterns = [
    path(
        "adjustments/", StockAdjustmentListView.as_view(), name="stock_adjustment_list"
    ),
]
