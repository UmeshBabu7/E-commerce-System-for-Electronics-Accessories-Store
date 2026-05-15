from django.urls import path
from orders.views import PlaceOrderView

urlpatterns = [
    path("place/", PlaceOrderView.as_view(), name="place_order"),
]
