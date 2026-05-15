"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersApi } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { toast } from "@/hooks/useToast"
import { useRouter } from "next/navigation"

export function useMyOrders() {
  return useQuery({
    queryKey: queryKeys.orders.my,
    queryFn: () => ordersApi.myOrders().then((r) => r.data),
  })
}

export function useAllOrders(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.orders.all(params),
    queryFn: () => ordersApi.allOrders(params).then((r) => r.data),
  })
}

export function usePlaceOrder() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (data: { shipping_address: string; phone: string; notes?: string }) =>
      ordersApi.place(data).then((r) => r.data),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.detail })
      qc.invalidateQueries({ queryKey: queryKeys.orders.my })
      toast({ title: `Order #${order.id} placed successfully!` })
      router.push("/shop/orders")
    },
    onError: (error: any) =>
      toast({ title: error?.response?.data?.detail || "Failed to place order", variant: "destructive" }),
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ordersApi.updateStatus(id, status).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all() })
      toast({ title: "Order status updated" })
    },
  })
}
