"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cartApi } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { toast } from "@/hooks/useToast"
import { useAuth } from "@/hooks/useAuth"

export function useCart() {
  const { isAuthenticated, isCustomer } = useAuth()
  return useQuery({
    queryKey: queryKeys.cart.detail,
    queryFn: () => cartApi.get().then((r) => r.data),
    enabled: isAuthenticated && isCustomer,
  })
}

export function useAddToCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ product_id, quantity, variation_id }: { product_id: number; quantity: number; variation_id?: number }) =>
      cartApi.addItem(product_id, quantity, variation_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.detail })
      toast({ title: "Added to cart" })
    },
    onError: (error: any) =>
      toast({ title: error?.response?.data?.detail || "Failed to add to cart", variant: "destructive" }),
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ item_id, quantity }: { item_id: number; quantity: number }) =>
      cartApi.updateItem(item_id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart.detail }),
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (item_id: number) => cartApi.removeItem(item_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.detail })
      toast({ title: "Item removed from cart" })
    },
  })
}

export function useClearCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart.detail }),
  })
}
