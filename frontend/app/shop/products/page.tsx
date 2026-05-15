"use client";
import { useState } from "react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ShoppingCart, Search, Package } from "lucide-react";

export default function ShopProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
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
                  onClick={() =>
                    addToCart.mutate({ product_id: product.id, quantity: 1 })
                  }
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {product.stock_level === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
