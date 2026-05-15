"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/auth/login");
    } else {
      const user = getCurrentUser();
      if (user?.role === "customer") router.replace("/shop/products");
      else router.replace("/dashboard");
    }
  }, [router]);
  return (
    <div className="flex h-screen items-center justify-center">
      Redirecting...
    </div>
  );
}
