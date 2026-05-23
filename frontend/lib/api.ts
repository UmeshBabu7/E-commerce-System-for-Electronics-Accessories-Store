import apiClient from "./axios"
import type { User, Product,ProductVariation, Cart, Order, StockAdjustment, DashboardData, PaginatedResponse, Category } from "@/types"


export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login/", { email, password }),
  register: (data: Record<string, string>) =>
    apiClient.post("/auth/register/", data),
  logout: (refresh: string) =>
    apiClient.post("/auth/logout/", { refresh }),
  profile: () =>
    apiClient.get<User>("/auth/profile/"),
  updateProfile: (data: Partial<User>) =>
    apiClient.patch<User>("/auth/profile/", data),
  changePassword: (data: { old_password: string; new_password: string; confirm_password: string }) =>
    apiClient.post("/auth/change-password/", data),
  listUsers: () =>
    apiClient.get<User[]>("/auth/users/"),
  updateUser: (id: number, data: Partial<User>) =>
    apiClient.patch<User>(`/auth/users/${id}/`, data),
  deleteUser: (id: number) =>
    apiClient.delete(`/auth/users/${id}/`),
}


export const productsApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Product>>("/products/", { params }),
  get: (id: number) =>
    apiClient.get<Product>(`/products/${id}/`),
  create: (data: FormData) =>
    apiClient.post<Product>("/products/", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: number, data: FormData) =>
    apiClient.patch<Product>(`/products/${id}/`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: number) =>
    apiClient.delete(`/products/${id}/`),
  listCategories: () =>
    apiClient.get<Category[]>("/products/categories/"),
  createCategory: (data: { name: string; description: string }) =>
    apiClient.post<Category>("/products/categories/", data),
  listVariations: (productId: number) =>
    apiClient.get<ProductVariation[]>(`/products/${productId}/variations/`),
  createVariation: (productId: number, data: { attribute: string; value: string; additional_price: number; stock_level: number }) =>
    apiClient.post<ProductVariation>(`/products/${productId}/variations/`, data),
  updateVariation: (productId: number, varId: number, data: Partial<{ attribute: string; value: string; additional_price: number; stock_level: number }>) =>
    apiClient.patch<ProductVariation>(`/products/${productId}/variations/${varId}/`, data),
  deleteVariation: (productId: number, varId: number) =>
    apiClient.delete(`/products/${productId}/variations/${varId}/`),
}


export const inventoryApi = {
  overview: () =>
    apiClient.get("/inventory/"),
  adjustments: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<StockAdjustment>>("/inventory/adjustments/", { params }),
  receive: (product_id: number, quantity: number, notes?: string) =>
    apiClient.post("/inventory/receive/", { product_id, quantity, notes }),
  adjust: (data: { product_id: number; quantity: number; adjustment_type: string; notes?: string }) =>
    apiClient.post("/inventory/adjust/", data),
  lowStock: () =>
    apiClient.get<Product[]>("/inventory/low-stock/"),
}


export const cartApi = {
  get: () =>
    apiClient.get<Cart>("/cart/"),
  addItem: (product_id: number, quantity: number, variation_id?: number) =>
    apiClient.post<Cart>("/cart/", { product_id, quantity, variation_id }),
  updateItem: (item_id: number, quantity: number) =>
    apiClient.patch<Cart>(`/cart/items/${item_id}/`, { quantity }),
  removeItem: (item_id: number) =>
    apiClient.delete<Cart>(`/cart/items/${item_id}/`),
  clear: () =>
    apiClient.delete("/cart/"),
}


export const ordersApi = {
  place: (data: { shipping_address: string; phone: string; notes?: string }) =>
    apiClient.post<Order>("/orders/place/", data),
  myOrders: () =>
    apiClient.get<PaginatedResponse<Order>>("/orders/my/"),
  myOrderDetail: (id: number) =>
    apiClient.get<Order>(`/orders/my/${id}/`),
  allOrders: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Order>>("/orders/all/", { params }),
  updateStatus: (id: number, status: string) =>
    apiClient.patch<Order>(`/orders/${id}/status/`, { status }),
}


export const analyticsApi = {
  dashboard: () =>
    apiClient.get<DashboardData>("/analytics/dashboard/"),
  profit: (period?: string) =>
    apiClient.get("/analytics/profit/", { params: { period } }),
  downloadSalesReport: () =>
    apiClient.get("/analytics/reports/sales/", { responseType: "blob" }),
  downloadOrderHistory: () =>
    apiClient.get("/analytics/reports/orders/", { responseType: "blob" }),
}
