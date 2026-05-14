from django.db import models
from django.conf import settings


class StockAdjustment(models.Model):
    ADJUSTMENT_TYPES = [
        ("receive", "Receive Stock"),
        ("adjustment", "Manual Adjustment"),
        ("sale", "Sale Deduction"),
        ("return", "Return"),
        ("damage", "Damage/Loss"),
    ]

    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE, related_name="stock_adjustments"
    )
    adjustment_type = models.CharField(max_length=20, choices=ADJUSTMENT_TYPES)
    quantity = models.IntegerField()
    previous_stock = models.PositiveIntegerField()
    new_stock = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name} | {self.adjustment_type} | {self.quantity}"
