"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inventoryApi } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { toast } from "@/hooks/useToast"

export function useInventoryOverview() {
  return useQuery({
    queryKey: queryKeys.inventory.overview,
    queryFn: () => inventoryApi.overview().then((r) => r.data),
  })
}

export function useStockAdjustments(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.inventory.adjustments(params),
    queryFn: () => inventoryApi.adjustments(params).then((r) => r.data),
  })
}

export function useLowStock() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock,
    queryFn: () => inventoryApi.lowStock().then((r) => r.data),
  })
}

export function useReceiveStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ product_id, quantity, notes }: { product_id: number; quantity: number; notes?: string }) =>
      inventoryApi.receive(product_id, quantity, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all })
      qc.invalidateQueries({ queryKey: queryKeys.inventory.overview })
      qc.invalidateQueries({ queryKey: queryKeys.inventory.adjustments() })
      toast({ title: "Stock received successfully" })
    },
    onError: (e: any) => toast({ title: e?.response?.data?.detail || "Failed to receive stock", variant: "destructive" }),
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { product_id: number; quantity: number; adjustment_type: string; notes?: string }) =>
      inventoryApi.adjust(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all })
      qc.invalidateQueries({ queryKey: queryKeys.inventory.overview })
      qc.invalidateQueries({ queryKey: queryKeys.inventory.adjustments() })
      toast({ title: "Stock adjusted successfully" })
    },
    onError: (e: any) => toast({ title: e?.response?.data?.detail || "Failed to adjust stock", variant: "destructive" }),
  })
}
