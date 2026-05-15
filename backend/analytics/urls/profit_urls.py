from django.urls import path
from analytics.views import ProfitAnalyticsView

urlpatterns = [
    path("profit/", ProfitAnalyticsView.as_view(), name="profit_analytics"),
]
