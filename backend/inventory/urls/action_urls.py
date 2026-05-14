from django.urls import path
from inventory.views import ReceiveStockView, AdjustStockView

urlpatterns = [
    path("receive/", ReceiveStockView.as_view(), name="receive_stock"),
    path("adjust/", AdjustStockView.as_view(), name="adjust_stock"),
]
