from django.db import models
from products.models.product import Product


class ProductVariation(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="variations"
    )
    attribute = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_level = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["product", "attribute", "value"]

    def __str__(self):
        return f"{self.product.name} - {self.attribute}: {self.value}"
