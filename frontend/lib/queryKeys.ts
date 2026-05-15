export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
    users: ["auth", "users"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params?: Record<string, string>) => ["products", "list", params] as const,
    detail: (id: number) => ["products", id] as const,
    categories: ["products", "categories"] as const,
  },
  inventory: {
    overview: ["inventory", "overview"] as const,
    adjustments: (params?: Record<string, string>) => ["inventory", "adjustments", params] as const,
    lowStock: ["inventory", "low-stock"] as const,
  },
  cart: {
    detail: ["cart"] as const,
  },
  orders: {
    my: ["orders", "my"] as const,
    myDetail: (id: number) => ["orders", "my", id] as const,
    all: (params?: Record<string, string>) => ["orders", "all", params] as const,
  },
  analytics: {
    dashboard: ["analytics", "dashboard"] as const,
    profit: (period?: string) => ["analytics", "profit", period] as const,
  },
}
