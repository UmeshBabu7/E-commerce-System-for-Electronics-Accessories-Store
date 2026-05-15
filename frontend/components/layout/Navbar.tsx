"use client";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { data: cart } = useCart();

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-primary"
          >
            <Package className="h-5 w-5" />
            ElectroStore
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {currentUser?.role === "customer" && (
                  <>
                    <Link href="/shop/products">
                      <Button variant="ghost" size="sm">
                        Products
                      </Button>
                    </Link>
                    <Link href="/shop/cart" className="relative">
                      <Button variant="ghost" size="icon">
                        <ShoppingCart className="h-5 w-5" />
                        {cart && cart.total_items > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                            {cart.total_items}
                          </span>
                        )}
                      </Button>
                    </Link>
                    <Link href="/shop/orders">
                      <Button variant="ghost" size="sm">
                        My Orders
                      </Button>
                    </Link>
                  </>
                )}
                {(currentUser?.role === "staff" ||
                  currentUser?.role === "admin") && (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => logout()}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
