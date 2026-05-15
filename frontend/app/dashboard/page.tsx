"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: () => analyticsApi.dashboard().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;

  const kpiCards = [
    {
      label: "Total Orders",
      value: data.kpi.total_orders,
      icon: ShoppingBag,
      color: "text-blue-600",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(data.kpi.monthly_revenue),
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Total Customers",
      value: data.kpi.total_customers,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Total Products",
      value: data.kpi.total_products,
      icon: Package,
      color: "text-orange-600",
    },
    {
      label: "Low Stock",
      value: data.kpi.low_stock_count,
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Pending Orders",
      value: data.kpi.pending_orders,
      icon: Clock,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.orders_by_status}>
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {data.orders_by_status.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.weekly_top_products.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sales this week
                </p>
              ) : (
                data.weekly_top_products.map((p, i) => (
                  <div
                    key={p.product__id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground w-5">
                        #{i + 1}
                      </span>
                      <span className="text-sm font-medium">
                        {p.product__name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">
                        {p.total_qty} sold
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(p.total_revenue)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.revenue_trend && data.revenue_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.revenue_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "revenue"
                      ? [`$${Number(value).toFixed(2)}`, "Revenue"]
                      : [value, "Orders"]
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="orders"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-16 text-center">
              No revenue data for the last 30 days
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {data.monthly_top_products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sales this month
              </p>
            ) : (
              data.monthly_top_products.map((p, i) => (
                <div
                  key={p.product__id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <span className="text-2xl font-black text-muted-foreground">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{p.product__name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.product__sku}
                    </p>
                    <p className="text-sm font-bold">
                      {p.total_qty} units · {formatCurrency(p.total_revenue)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
