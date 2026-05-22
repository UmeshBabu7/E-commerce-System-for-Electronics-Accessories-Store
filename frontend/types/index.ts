export interface User {
  id: number
  username: string
  email: string
  role: "customer" | "staff" | "admin"
  phone: string
  address: string
  created_at: string
  is_active: boolean
}

export interface Category {
  id: number
  name: string
  description: string
}

export interface ProductVariation {
  id: number
  attribute: string
  value: string
  additional_price: number
  stock_level: number
}

export interface Product {
  id: number
  sku: string
  name: string
  description: string
  categories: Category[]
  variations: ProductVariation[]
  cost_price?: number
  selling_price: number
  stock_level: number
  reorder_point: number
  image: string | null
  is_active: boolean
  is_low_stock: boolean
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: number
  product: number
  product_name: string
  product_sku: string
  product_image: string | null
  variation: number | null
  variation_label: string | null
  quantity: number
  unit_price: number
  total_price: number
  available_stock: number
  added_at?: string
}

export interface Cart {
  id: number
  items: CartItem[]
  subtotal: number
  total_items: number
  updated_at?: string
}

export interface OrderItem {
  id: number
  product: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"

export interface Order {
  id: number
  user: number
  user_email: string
  user_name: string
  status: OrderStatus
  shipping_address: string
  phone: string
  notes: string
  total_amount: number
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface StockAdjustment {
  id: number
  product: number
  product_name: string
  product_sku: string
  adjustment_type: string
  quantity: number
  previous_stock: number
  new_stock: number
  notes: string
  performed_by_name: string
  created_at: string
}

export interface DashboardData {
  kpi: {
    total_orders: number
    recent_orders: number
    total_revenue: number
    monthly_revenue: number
    total_customers: number
    total_products: number
    low_stock_count: number
    pending_orders: number
  }
  weekly_top_products: Array<{ product__id: number; product__name: string; product__sku: string; total_qty: number; total_revenue: number }>
  monthly_top_products: Array<{ product__id: number; product__name: string; product__sku: string; total_qty: number; total_revenue: number }>
  orders_by_status: Array<{ status: string; count: number }>
  revenue_trend: Array<{ date: string; revenue: number; orders: number }>
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
