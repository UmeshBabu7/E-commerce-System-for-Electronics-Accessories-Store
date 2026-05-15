from django.urls import path
from analytics.views import SalesReportCSVView, OrderHistoryCSVView

urlpatterns = [
    path("reports/sales/", SalesReportCSVView.as_view(), name="sales_report_csv"),
    path("reports/orders/", OrderHistoryCSVView.as_view(), name="order_history_csv"),
]
