"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/utils";
import { placeOrderSchema, type PlaceOrderInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ShoppingCart, Trash2, Minus, Plus, Package } from "lucide-react";

function CheckoutDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const placeOrder = usePlaceOrder();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlaceOrderInput>({
    resolver: zodResolver(placeOrderSchema),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((d) => placeOrder.mutate(d))}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label>Shipping Address</Label>
            <Textarea
              {...register("shipping_address")}
              rows={3}
              placeholder="Enter your full shipping address"
            />
            {errors.shipping_address && (
              <p className="text-xs text-red-500">
                {errors.shipping_address.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Phone Number</Label>
            <Input {...register("phone")} placeholder="98XXXXXXXX" />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Order Notes (optional)</Label>
            <Textarea
              {...register("notes")}
              rows={2}
              placeholder="Any special instructions?"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={placeOrder.isPending}>
              {placeOrder.isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CartPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  if (isLoading) return <LoadingSpinner />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <ShoppingCart className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="mb-6">Start shopping to add items to your cart</p>
        <Link href="/shop/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Shopping Cart ({cart.total_items} items)
        </h1>
        <Button variant="outline" size="sm" onClick={() => clearCart.mutate()}>
          <Trash2 className="h-4 w-4 mr-1" />
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {item.product_image ? (
                      <img
                        src={`http://localhost:8000${item.product_image}`}
                        alt={item.product_name}
                        className="h-full w-full object-cover rounded"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">
                      {item.product_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {item.product_sku}
                    </p>
                    {item.variation_label && (
                      <p className="text-xs text-blue-600">
                        {item.variation_label}
                      </p>
                    )}
                    <p className="text-sm font-bold text-primary mt-1">
                      {formatCurrency(item.unit_price)} each
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold">
                      {formatCurrency(item.total_price)}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          item.quantity > 1
                            ? updateItem.mutate({
                                item_id: item.id,
                                quantity: item.quantity - 1,
                              })
                            : removeItem.mutate(item.id)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={item.quantity >= item.available_stock}
                        onClick={() =>
                          updateItem.mutate({
                            item_id: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() => removeItem.mutate(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.total_price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">
                {formatCurrency(cart.subtotal)}
              </span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => setCheckoutOpen(true)}
            >
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}
