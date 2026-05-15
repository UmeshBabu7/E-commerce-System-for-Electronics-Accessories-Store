from django.db.models import Sum, F
from django.db.models.functions import TruncWeek, TruncMonth
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from orders.models import OrderItem


class ProfitAnalyticsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        period = request.query_params.get("period", "monthly")
        now = timezone.now()

        if period == "weekly":
            start_date = now - timedelta(weeks=12)
            trunc_fn = TruncWeek
        else:
            start_date = now - timedelta(days=365)
            trunc_fn = TruncMonth

        items = OrderItem.objects.filter(
            order__created_at__gte=start_date,
            order__status__in=["confirmed", "processing", "shipped", "delivered"],
        )

        revenue_data = (
            items.annotate(period=trunc_fn("order__created_at"))
            .values("period")
            .annotate(
                revenue=Sum(F("quantity") * F("unit_price")),
                cogs=Sum(F("quantity") * F("cost_price")),
            )
            .order_by("period")
        )

        chart_data = []
        for row in revenue_data:
            revenue = float(row["revenue"] or 0)
            cogs = float(row["cogs"] or 0)
            chart_data.append(
                {
                    "period": row["period"].strftime("%Y-%m-%d")
                    if row["period"]
                    else None,
                    "revenue": revenue,
                    "cogs": cogs,
                    "profit": revenue - cogs,
                    "margin": round((revenue - cogs) / revenue * 100, 2)
                    if revenue
                    else 0,
                }
            )

        total_revenue = sum(r["revenue"] for r in chart_data)
        total_cogs = sum(r["cogs"] for r in chart_data)
        total_profit = total_revenue - total_cogs

        return Response(
            {
                "chart_data": chart_data,
                "summary": {
                    "total_revenue": total_revenue,
                    "total_cogs": total_cogs,
                    "total_profit": total_profit,
                    "profit_margin": round(total_profit / total_revenue * 100, 2)
                    if total_revenue
                    else 0,
                },
            }
        )
