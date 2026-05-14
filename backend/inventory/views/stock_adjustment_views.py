from rest_framework import generics
from inventory.models import StockAdjustment
from inventory.serializers import StockAdjustmentSerializer
from accounts.permissions import IsStaffOrAdmin


class StockAdjustmentListView(generics.ListAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = StockAdjustmentSerializer

    def get_queryset(self):
        qs = StockAdjustment.objects.select_related("product", "performed_by")
        product_id = self.request.query_params.get("product")
        adj_type = self.request.query_params.get("type")
        if product_id:
            qs = qs.filter(product_id=product_id)
        if adj_type:
            qs = qs.filter(adjustment_type=adj_type)
        return qs
