from django.db.models import Sum, Count, F
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.permissions import IsStaffOrAdmin
from orders.models import Order, OrderItem
from products.models import Product
from accounts.models import User


class DashboardView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        seven_days_ago = now - timedelta(days=7)

        total_orders = Order.objects.count()
        recent_orders = Order.objects.filter(created_at__gte=thirty_days_ago).count()
        total_revenue = (
            Order.objects.filter(
                status__in=["confirmed", "processing", "shipped", "delivered"]
            ).aggregate(total=Sum("total_amount"))["total"]
            or 0
        )

        monthly_revenue = (
            Order.objects.filter(
                created_at__gte=thirty_days_ago,
                status__in=["confirmed", "processing", "shipped", "delivered"],
            ).aggregate(total=Sum("total_amount"))["total"]
            or 0
        )

        total_customers = User.objects.filter(role="customer").count()
        total_products = Product.objects.filter(is_active=True).count()
        low_stock_count = Product.objects.filter(
            stock_level__lte=F("reorder_point"), is_active=True
        ).count()
        pending_orders = Order.objects.filter(status="pending").count()

        weekly_top = (
            OrderItem.objects.filter(order__created_at__gte=seven_days_ago)
            .values("product__id", "product__name", "product__sku")
            .annotate(
                total_qty=Sum("quantity"),
                total_revenue=Sum(F("quantity") * F("unit_price")),
            )
            .order_by("-total_qty")[:5]
        )

        monthly_top = (
            OrderItem.objects.filter(order__created_at__gte=thirty_days_ago)
            .values("product__id", "product__name", "product__sku")
            .annotate(
                total_qty=Sum("quantity"),
                total_revenue=Sum(F("quantity") * F("unit_price")),
            )
            .order_by("-total_qty")[:5]
        )

        orders_by_status = Order.objects.values("status").annotate(count=Count("id"))

        return Response(
            {
                "kpi": {
                    "total_orders": total_orders,
                    "recent_orders": recent_orders,
                    "total_revenue": total_revenue,
                    "monthly_revenue": monthly_revenue,
                    "total_customers": total_customers,
                    "total_products": total_products,
                    "low_stock_count": low_stock_count,
                    "pending_orders": pending_orders,
                },
                "weekly_top_products": list(weekly_top),
                "monthly_top_products": list(monthly_top),
                "orders_by_status": list(orders_by_status),
            }
        )
