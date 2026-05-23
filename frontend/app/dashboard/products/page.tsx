"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Search, Layers } from "lucide-react";
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";
import { productsApi } from "@/lib/api";
import { productSchema, type ProductInput } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/useToast";
import type { Product, ProductVariation } from "@/types";

function ProductForm({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const { data: catData } = useCategories();
  const categories = Array.isArray(catData)
    ? catData
    : ((catData as any)?.results ?? []);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description,
          category_ids: product.categories.map((c) => c.id),
          cost_price: String(product.cost_price ?? 0),
          selling_price: String(product.selling_price),
          stock_level: String(product.stock_level),
          reorder_point: String(product.reorder_point),
        }
      : { category_ids: [] },
  });

  const selectedCats = watch("category_ids") || [];

  const toggleCategory = (id: number) => {
    const current = selectedCats.includes(id)
      ? selectedCats.filter((c) => c !== id)
      : [...selectedCats, id];
    setValue("category_ids", current);
  };

  const onSubmit = async (data: ProductInput) => {
    const fd = new FormData();
    fd.append("sku", data.sku);
    fd.append("name", data.name);
    fd.append("description", data.description || "");
    fd.append("cost_price", data.cost_price);
    fd.append("selling_price", data.selling_price);
    fd.append("stock_level", data.stock_level);
    fd.append("reorder_point", data.reorder_point);
    data.category_ids.forEach((id) => fd.append("category_ids", String(id)));
    try {
      if (product) await updateProduct.mutateAsync(fd);
      else await createProduct.mutateAsync(fd);
      onClose();
    } catch {}
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>SKU</Label>
          <Input {...register("sku")} placeholder="SKU-001" />
          {errors.sku && (
            <p className="text-xs text-red-500">{errors.sku.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Product Name</Label>
          <Input {...register("name")} placeholder="USB-C Cable" />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Cost Price (NPR)</Label>
          <Input type="number" step="0.01" {...register("cost_price")} />
          {errors.cost_price && (
            <p className="text-xs text-red-500">{errors.cost_price.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Selling Price (NPR)</Label>
          <Input type="number" step="0.01" {...register("selling_price")} />
          {errors.selling_price && (
            <p className="text-xs text-red-500">
              {errors.selling_price.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Stock Level</Label>
          <Input type="number" {...register("stock_level")} />
          {errors.stock_level && (
            <p className="text-xs text-red-500">{errors.stock_level.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Reorder Point</Label>
          <Input type="number" {...register("reorder_point")} />
          {errors.reorder_point && (
            <p className="text-xs text-red-500">
              {errors.reorder_point.message}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea {...register("description")} rows={2} />
      </div>
      <div className="space-y-1">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c: any) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategory(c.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                selectedCats.includes(c.id)
                  ? "bg-primary text-white border-primary"
                  : "border-gray-300 hover:border-primary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {errors.category_ids && (
          <p className="text-xs text-red-500">{errors.category_ids.message}</p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : product
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

function VariationsDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const queryKey = ["variations", product.id];

  const { data: variations = [], isLoading } = useQuery<ProductVariation[]>({
    queryKey,
    queryFn: () =>
      productsApi
        .listVariations(product.id)
        .then((r) => (Array.isArray(r.data) ? r.data : (r.data.results ?? []))),
    enabled: open,
  });

  const [form, setForm] = useState({
    attribute: "",
    value: "",
    additional_price: "0",
    stock_level: "0",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setForm({
      attribute: "",
      value: "",
      additional_price: "0",
      stock_level: "0",
    });
    setEditingId(null);
  };

  const startEdit = (v: ProductVariation) => {
    setEditingId(v.id);
    setForm({
      attribute: v.attribute,
      value: v.value,
      additional_price: String(v.additional_price),
      stock_level: String(v.stock_level),
    });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      productsApi.createVariation(product.id, {
        attribute: form.attribute,
        value: form.value,
        additional_price: parseFloat(form.additional_price) || 0,
        stock_level: parseInt(form.stock_level) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Variation added" });
      resetForm();
    },
    onError: () =>
      toast({ title: "Failed to add variation", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (varId: number) =>
      productsApi.updateVariation(product.id, varId, {
        attribute: form.attribute,
        value: form.value,
        additional_price: parseFloat(form.additional_price) || 0,
        stock_level: parseInt(form.stock_level) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Variation updated" });
      resetForm();
    },
    onError: () =>
      toast({ title: "Failed to update variation", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (varId: number) =>
      productsApi.deleteVariation(product.id, varId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Variation deleted" });
    },
    onError: () =>
      toast({ title: "Failed to delete variation", variant: "destructive" }),
  });

  const handleSave = () => {
    if (!form.attribute.trim() || !form.value.trim()) {
      toast({
        title: "Attribute and Value are required",
        variant: "destructive",
      });
      return;
    }
    if (editingId !== null) updateMutation.mutate(editingId);
    else createMutation.mutate();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Variations — {product.name}</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {editingId !== null ? "Edit Variation" : "Add New Variation"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>
                  Attribute{" "}
                  <span className="text-xs text-muted-foreground">
                    (e.g. Color, Model)
                  </span>
                </Label>
                <Input
                  placeholder="Color"
                  value={form.attribute}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, attribute: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>
                  Value{" "}
                  <span className="text-xs text-muted-foreground">
                    (e.g. Red, iPhone 15)
                  </span>
                </Label>
                <Input
                  placeholder="Red"
                  value={form.value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, value: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Additional Price (NPR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.additional_price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, additional_price: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Stock Level</Label>
                <Input
                  type="number"
                  value={form.stock_level}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock_level: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editingId !== null && (
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Variation"
                    : "Add Variation"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-2">
          {isLoading ? (
            <LoadingSpinner />
          ) : variations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No variations yet. Add one above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attribute</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Additional Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((v) => (
                  <TableRow
                    key={v.id}
                    className={editingId === v.id ? "bg-muted/50" : ""}
                  >
                    <TableCell className="font-medium">{v.attribute}</TableCell>
                    <TableCell>{v.value}</TableCell>
                    <TableCell>{formatCurrency(v.additional_price)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          v.stock_level === 0
                            ? "text-red-500 font-semibold"
                            : ""
                        }
                      >
                        {v.stock_level}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(v)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteMutation.mutate(v.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [variationsProduct, setVariationsProduct] = useState<Product | null>(
    null,
  );
  const { data, isLoading } = useProducts(search ? { search } : undefined);
  const deleteProduct = useDeleteProduct();

  const products = data?.results ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onClose={() => setOpenCreate(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Variations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-8"
                    >
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs">
                        {product.sku}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.categories.map((c) => (
                            <Badge
                              key={c.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {c.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(product.cost_price ?? 0)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(product.selling_price)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            product.is_low_stock
                              ? "text-red-600 font-semibold"
                              : ""
                          }
                        >
                          {product.stock_level}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.variations?.length ?? 0} var.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.is_active ? "success" : "secondary"}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog
                            open={editProduct?.id === product.id}
                            onOpenChange={(o) => !o && setEditProduct(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditProduct(product)}
                                title="Edit Product"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                              </DialogHeader>
                              {editProduct && (
                                <ProductForm
                                  product={editProduct}
                                  onClose={() => setEditProduct(null)}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setVariationsProduct(product)}
                            title="Manage Variations"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Layers className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProduct.mutate(product.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Deactivate Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {variationsProduct && (
        <VariationsDialog
          product={variationsProduct}
          open={!!variationsProduct}
          onOpenChange={(o) => !o && setVariationsProduct(null)}
        />
      )}
    </div>
  );
}
