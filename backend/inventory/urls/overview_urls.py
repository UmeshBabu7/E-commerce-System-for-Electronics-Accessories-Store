from django.urls import path
from inventory.views import InventoryOverviewView, LowStockView

urlpatterns = [
    path("", InventoryOverviewView.as_view(), name="inventory_overview"),
    path("low-stock/", LowStockView.as_view(), name="low_stock"),
]
