"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Download } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.profit(period),
    queryFn: () => analyticsApi.profit(period).then((r) => r.data),
  });

  const handleDownload = async (type: "sales" | "orders") => {
    try {
      const res =
        type === "sales"
          ? await analyticsApi.downloadSalesReport()
          : await analyticsApi.downloadOrderHistory();
      downloadBlob(new Blob([res.data]), `${type}_report.csv`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("sales")}
          >
            <Download className="h-4 w-4 mr-1" />
            Sales CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("orders")}
          >
            <Download className="h-4 w-4 mr-1" />
            Orders CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["monthly", "weekly"] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: "Total Revenue",
              value: formatCurrency(data.summary.total_revenue),
            },
            {
              label: "Total COGS",
              value: formatCurrency(data.summary.total_cogs),
            },
            {
              label: "Total Profit",
              value: formatCurrency(data.summary.total_profit),
            },
            { label: "Profit Margin", value: `${data.summary.profit_margin}%` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        data && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs COGS</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="cogs" fill="#f59e0b" name="COGS" />
                    <Bar dataKey="profit" fill="#10b981" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margin %</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                    <YAxis unit="%" />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Line
                      type="monotone"
                      dataKey="margin"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Margin %"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </div>
  );
}
