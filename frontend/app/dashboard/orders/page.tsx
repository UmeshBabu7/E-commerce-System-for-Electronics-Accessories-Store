"use client";
import { useState } from "react";
import { useAllOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { Order, OrderStatus } from "@/types";
import { Eye } from "lucide-react";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function OrderDetailDialog({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const updateStatus = useUpdateOrderStatus();
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{order.user_name}</p>
              <p className="text-muted-foreground">{order.user_email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{formatDateTime(order.created_at)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{order.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Shipping Address</p>
              <p className="font-medium">{order.shipping_address}</p>
            </div>
          </div>
          {order.notes && (
            <div className="text-sm">
              <p className="text-muted-foreground">Notes</p>
              <p>{order.notes}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm border rounded px-3 py-2"
                >
                  <div>
                    <span className="font-medium">{item.product_name}</span>
                    <span className="text-muted-foreground ml-2">
                      (SKU: {item.product_sku})
                    </span>
                  </div>
                  <div className="text-right">
                    <span>
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </span>
                    <span className="font-bold ml-2">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2 font-bold text-lg">
              Total: {formatCurrency(order.total_amount)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Update Status:</span>
            <Select
              defaultValue={order.status}
              onValueChange={(v) =>
                updateStatus.mutate({ id: order.id, status: v })
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data, isLoading } = useAllOrders(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const orders = data?.results ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-bold">
                        #{order.id}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{order.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.user_email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDateTime(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
