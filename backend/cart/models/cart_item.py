from django.db import models
from .cart import Cart


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    variation = models.ForeignKey(
        "products.ProductVariation", on_delete=models.SET_NULL, null=True, blank=True
    )
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["cart", "product", "variation"]

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def unit_price(self):
        price = self.product.selling_price
        if self.variation:
            price += self.variation.additional_price
        return price

    @property
    def total_price(self):
        return self.unit_price * self.quantity
