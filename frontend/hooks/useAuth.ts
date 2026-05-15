"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { setTokens, clearTokens, getCurrentUser, getRefreshToken } from "@/lib/auth"
import { queryKeys } from "@/lib/queryKeys"

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authApi.profile().then((r) => r.data),
    retry: false,
    enabled: !!getCurrentUser(),
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (response) => {
      const { access, refresh } = response.data
      setTokens(access, refresh)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile })
      const user = getCurrentUser()
      if (user?.role === "customer") {
        router.push("/shop/products")
      } else {
        router.push("/dashboard")
      }
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => {
      const refresh = getRefreshToken() || ""
      return authApi.logout(refresh)
    },
    onSettled: () => {
      clearTokens()
      queryClient.clear()
      router.push("/auth/login")
    },
  })

  const currentUser = getCurrentUser()

  return {
    user: profile,
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === "admin",
    isStaff: currentUser?.role === "staff" || currentUser?.role === "admin",
    isCustomer: currentUser?.role === "customer",
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
  }
}
