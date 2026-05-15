"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isStaff, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isStaff) {
      router.replace("/shop/products");
    }
  }, [isStaff, isLoading, router]);

  if (isLoading || !isStaff) return null;
  return <DashboardLayout>{children}</DashboardLayout>;
}
