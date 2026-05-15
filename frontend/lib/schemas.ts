import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password2: z.string().min(8),
  phone: z.string().optional(),
  address: z.string().optional(),
}).refine((d) => d.password === d.password2, {
  message: "Passwords do not match",
  path: ["password2"],
})

export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category_ids: z.array(z.number()).min(1, "Select at least one category"),
  cost_price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Invalid price"),
  selling_price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Invalid price"),
  stock_level: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Invalid quantity"),
  reorder_point: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Invalid quantity"),
})

export const placeOrderSchema = z.object({
  shipping_address: z.string().min(5, "Please enter a valid shipping address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().optional(),
})

export const receiveStockSchema = z.object({
  product_id: z.number().min(1, "Select a product"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
})

export const adjustStockSchema = z.object({
  product_id: z.number().min(1, "Select a product"),
  quantity: z.number().refine((v) => v !== 0, "Quantity cannot be zero"),
  adjustment_type: z.enum(["adjustment", "damage", "return"]),
  notes: z.string().optional(),
})

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>
export type ReceiveStockInput = z.infer<typeof receiveStockSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
