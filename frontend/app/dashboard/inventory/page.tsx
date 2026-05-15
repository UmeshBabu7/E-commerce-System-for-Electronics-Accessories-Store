"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackagePlus, Settings, AlertTriangle } from "lucide-react";
import {
  useInventoryOverview,
  useStockAdjustments,
  useLowStock,
  useReceiveStock,
  useAdjustStock,
} from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";
import {
  receiveStockSchema,
  adjustStockSchema,
  type ReceiveStockInput,
  type AdjustStockInput,
} from "@/lib/schemas";
import { formatCurrency, formatDateTime } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

function ReceiveStockDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: productsData } = useProducts();
  const products = productsData?.results ?? [];
  const receiveStock = useReceiveStock();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ReceiveStockInput>({
    resolver: zodResolver(receiveStockSchema),
  });
  const onSubmit = async (data: ReceiveStockInput) => {
    await receiveStock.mutateAsync(data);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Product</Label>
            <Select onValueChange={(v) => setValue("product_id", Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} (SKU: {p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product_id && (
              <p className="text-xs text-red-500">
                {errors.product_id.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500">{errors.quantity.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Textarea {...register("notes")} rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={receiveStock.isPending}>
              {receiveStock.isPending ? "Processing..." : "Receive Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdjustStockDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: productsData } = useProducts();
  const products = productsData?.results ?? [];
  const adjustStock = useAdjustStock();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AdjustStockInput>({
    resolver: zodResolver(adjustStockSchema),
  });
  const onSubmit = async (data: AdjustStockInput) => {
    await adjustStock.mutateAsync(data);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Product</Label>
            <Select onValueChange={(v) => setValue("product_id", Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} (Stock: {p.stock_level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Adjustment Type</Label>
            <Select
              onValueChange={(v) => setValue("adjustment_type", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                <SelectItem value="damage">Damage / Loss</SelectItem>
                <SelectItem value="return">Return</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Quantity (negative to deduct)</Label>
            <Input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500">{errors.quantity.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Textarea {...register("notes")} rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={adjustStock.isPending}>
              {adjustStock.isPending ? "Processing..." : "Adjust Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const ADJ_COLORS: Record<string, string> = {
  receive: "success",
  adjustment: "secondary",
  sale: "default",
  return: "warning",
  damage: "destructive",
};

export default function InventoryPage() {
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const { data: overview } = useInventoryOverview();
  const { data: adjustments, isLoading } = useStockAdjustments();
  const { data: lowStockData } = useLowStock();
  const lowStock = Array.isArray(lowStockData)
    ? lowStockData
    : ((lowStockData as any)?.results ?? []);
  const adjList = adjustments?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          <Button onClick={() => setReceiveOpen(true)}>
            <PackagePlus className="h-4 w-4 mr-1" />
            Receive Stock
          </Button>
          <Button variant="outline" onClick={() => setAdjustOpen(true)}>
            <Settings className="h-4 w-4 mr-1" />
            Adjust Stock
          </Button>
        </div>
      </div>

      {overview && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total Products", value: overview.total_products },
            {
              label: "Stock Value",
              value: formatCurrency(overview.total_stock_value),
            },
            {
              label: "Low Stock Items",
              value: overview.low_stock_count,
              alert: overview.low_stock_count > 0,
            },
            {
              label: "Out of Stock",
              value: overview.out_of_stock_count,
              alert: overview.out_of_stock_count > 0,
            },
          ].map(({ label, value, alert }) => (
            <Card key={label} className={alert ? "border-red-200" : ""}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p
                  className={`text-xl font-bold ${alert ? "text-red-600" : ""}`}
                >
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {lowStock.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alert ({lowStock.length} products)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStock.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white rounded border px-3 py-1 text-sm"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="ml-2 text-red-600 font-bold">
                    {p.stock_level} left
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Before</TableHead>
                  <TableHead>After</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      No adjustments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  adjList.map((adj) => (
                    <TableRow key={adj.id}>
                      <TableCell className="text-xs">
                        {formatDateTime(adj.created_at)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">
                          {adj.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {adj.product_sku}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ADJ_COLORS[adj.adjustment_type] as any}>
                          {adj.adjustment_type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          adj.quantity > 0
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {adj.quantity > 0 ? "+" : ""}
                        {adj.quantity}
                      </TableCell>
                      <TableCell>{adj.previous_stock}</TableCell>
                      <TableCell>{adj.new_stock}</TableCell>
                      <TableCell className="text-sm">
                        {adj.performed_by_name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {adj.notes}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ReceiveStockDialog
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
      />
      <AdjustStockDialog
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
      />
    </div>
  );
}
