"use client";
import { useState } from "react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ShoppingCart, Search, Package } from "lucide-react";
import type { Product, ProductVariation } from "@/types";

function VariationDialog({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const addToCart = useAddToCart();
  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | null>(null);
  const grouped = product.variations.reduce<Record<string, ProductVariation[]>>(
    (acc, v) => {
      if (!acc[v.attribute]) acc[v.attribute] = [];
      acc[v.attribute].push(v);
      return acc;
    },
    {},
  );

  const handleAdd = () => {
    addToCart.mutate(
      {
        product_id: product.id,
        quantity: 1,
        variation_id: selectedVariation?.id,
      },
      { onSuccess: onClose },
    );
  };

  const price = selectedVariation
    ? product.selling_price + selectedVariation.additional_price
    : product.selling_price;

  const stock = selectedVariation
    ? selectedVariation.stock_level
    : product.stock_level;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {Object.entries(grouped).map(([attribute, variations]) => (
            <div key={attribute} className="space-y-2">
              <p className="text-sm font-medium">{attribute}</p>
              <div className="flex flex-wrap gap-2">
                {variations.map((v) => (
                  <button
                    key={v.id}
                    disabled={v.stock_level === 0}
                    onClick={() =>
                      setSelectedVariation(
                        selectedVariation?.id === v.id ? null : v,
                      )
                    }
                    className={`rounded border px-3 py-1 text-sm transition-colors ${
                      v.stock_level === 0
                        ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400"
                        : selectedVariation?.id === v.id
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300 hover:border-primary"
                    }`}
                  >
                    {v.value}
                    {v.additional_price > 0 &&
                      ` (+${formatCurrency(v.additional_price)})`}
                    {v.stock_level === 0 && " (Out of stock)"}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-bold text-primary">
                {formatCurrency(price)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stock</span>
              <span
                className={
                  stock === 0
                    ? "text-red-500"
                    : stock <= 5
                      ? "text-yellow-600"
                      : "text-green-600"
                }
              >
                {stock === 0 ? "Out of stock" : `${stock} available`}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={
                stock === 0 ||
                addToCart.isPending ||
                (product.variations.length > 0 && !selectedVariation)
              }
              onClick={handleAdd}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {addToCart.isPending ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
          {product.variations.length > 0 && !selectedVariation && (
            <p className="text-xs text-center text-muted-foreground">
              Please select a variation to continue
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ShopProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const params: Record<string, string> = { is_active: "true" };
  if (search) params.search = search;
  if (categoryFilter) params.category = categoryFilter;

  const { data, isLoading } = useProducts(params);
  const { data: catData } = useCategories();
  const categories = Array.isArray(catData)
    ? catData
    : ((catData as any)?.results ?? []);
  const addToCart = useAddToCart();
  const products = data?.results ?? [];

  const handleAddToCart = (product: Product) => {
    if (product.variations && product.variations.length > 0) {
      setSelectedProduct(product);
    } else {
      addToCart.mutate({ product_id: product.id, quantity: 1 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Electronics & Accessories</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter("")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
            !categoryFilter
              ? "bg-primary text-white border-primary"
              : "border-gray-300 hover:border-primary"
          }`}
        >
          All
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(String(cat.id))}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              categoryFilter === String(cat.id)
                ? "bg-primary text-white border-primary"
                : "border-gray-300 hover:border-primary"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mb-3" />
          <p className="text-lg font-medium">No products found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={`http://localhost:8000${product.image}`}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-16 w-16 text-gray-300" />
                )}
              </div>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-1 mb-1">
                  {product.categories.map((c) => (
                    <Badge key={c.id} variant="secondary" className="text-xs">
                      {c.name}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-semibold text-sm leading-tight">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
                <p className="mt-1 font-bold text-primary">
                  {formatCurrency(product.selling_price)}
                </p>
                {product.variations && product.variations.length > 0 && (
                  <p className="text-xs text-blue-600 mt-0.5">
                    {product.variations.length} variation
                    {product.variations.length !== 1 ? "s" : ""} available
                  </p>
                )}
                <p
                  className={`text-xs mt-0.5 ${product.stock_level === 0 ? "text-red-500" : product.is_low_stock ? "text-yellow-600" : "text-green-600"}`}
                >
                  {product.stock_level === 0
                    ? "Out of stock"
                    : product.is_low_stock
                      ? `Only ${product.stock_level} left`
                      : `${product.stock_level} in stock`}
                </p>
              </CardContent>
              <CardFooter className="p-3 pt-0">
                <Button
                  className="w-full"
                  size="sm"
                  disabled={product.stock_level === 0 || addToCart.isPending}
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {product.stock_level === 0
                    ? "Out of Stock"
                    : product.variations && product.variations.length > 0
                      ? "Select Options"
                      : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {selectedProduct && (
        <VariationDialog
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
