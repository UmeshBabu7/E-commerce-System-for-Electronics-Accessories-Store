"use client";
import { useState } from "react";
import { useMyOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { Order } from "@/types";
import { ShoppingBag, Eye } from "lucide-react";

function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Order #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <OrderStatusBadge status={order.status} />
            <span className="text-sm text-muted-foreground">
              {formatDateTime(order.created_at)}
            </span>
          </div>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Shipping:</span>{" "}
              {order.shipping_address}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {order.phone}
            </p>
            {order.notes && (
              <p>
                <span className="font-medium">Notes:</span> {order.notes}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Items</p>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm border rounded p-2"
              >
                <div>
                  <span className="font-medium">{item.product_name}</span>
                  <span className="text-muted-foreground ml-2">
                    ×{item.quantity}
                  </span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span className="text-primary">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MyOrdersPage() {
  const { data, isLoading } = useMyOrders();
  const [selected, setSelected] = useState<Order | null>(null);
  const orders = data?.results ?? [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mb-3" />
          <p className="text-lg font-medium">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">Order #{order.id}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateTime(order.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() => setSelected(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {selected && (
        <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
