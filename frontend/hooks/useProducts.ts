"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productsApi } from "@/lib/api"
import { queryKeys } from "@/lib/queryKeys"
import { toast } from "@/hooks/useToast"

export function useProducts(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.list(params).then((r) => r.data),
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.get(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: () => productsApi.listCategories().then((r) => r.data),
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FormData) => productsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all })
      toast({ title: "Product created successfully" })
    },
    onError: () => toast({ title: "Failed to create product", variant: "destructive" }),
  })
}

export function useUpdateProduct(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FormData) => productsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all })
      qc.invalidateQueries({ queryKey: queryKeys.products.detail(id) })
      toast({ title: "Product updated successfully" })
    },
    onError: () => toast({ title: "Failed to update product", variant: "destructive" }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all })
      toast({ title: "Product deactivated" })
    },
  })
}
