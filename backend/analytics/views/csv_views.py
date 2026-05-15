import csv
from django.http import HttpResponse

from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from orders.models import Order, OrderItem


class SalesReportCSVView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="sales_report.csv"'
        writer = csv.writer(response)
        writer.writerow(
            ["Order ID", "Customer", "Email", "Status", "Total Amount", "Date"]
        )

        orders = Order.objects.select_related("user").order_by("-created_at")
        for order in orders:
            writer.writerow(
                [
                    order.id,
                    order.user.username,
                    order.user.email,
                    order.status,
                    order.total_amount,
                    order.created_at.strftime("%Y-%m-%d %H:%M"),
                ]
            )
        return response


class OrderHistoryCSVView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="order_history.csv"'
        writer = csv.writer(response)
        writer.writerow(
            [
                "Order ID",
                "Product Name",
                "SKU",
                "Quantity",
                "Unit Price",
                "Cost Price",
                "Subtotal",
                "Profit",
                "Order Date",
            ]
        )

        items = OrderItem.objects.select_related("order", "order__user").order_by(
            "-order__created_at"
        )
        for item in items:
            writer.writerow(
                [
                    item.order.id,
                    item.product_name,
                    item.product_sku,
                    item.quantity,
                    item.unit_price,
                    item.cost_price,
                    item.subtotal,
                    item.profit,
                    item.order.created_at.strftime("%Y-%m-%d"),
                ]
            )
        return response
