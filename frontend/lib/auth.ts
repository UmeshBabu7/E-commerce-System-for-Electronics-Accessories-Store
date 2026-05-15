import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

interface TokenPayload {
  email: string
  role: "customer" | "staff" | "admin"
  username: string
  exp: number
  user_id: number
}

export function setTokens(access: string, refresh: string) {
  Cookies.set("access_token", access, { expires: 1 / 24, secure: true, sameSite: "strict" })
  Cookies.set("refresh_token", refresh, { expires: 7, secure: true, sameSite: "strict" })
}

export function clearTokens() {
  Cookies.remove("access_token")
  Cookies.remove("refresh_token")
}

export function getAccessToken(): string | undefined {
  return Cookies.get("access_token")
}

export function getRefreshToken(): string | undefined {
  return Cookies.get("refresh_token")
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwtDecode<TokenPayload>(token)
  } catch {
    return null
  }
}

export function getCurrentUser(): TokenPayload | null {
  const token = getAccessToken()
  if (!token) return null
  return decodeToken(token)
}

export function isAuthenticated(): boolean {
  const token = getAccessToken()
  if (!token) return false
  const payload = decodeToken(token)
  if (!payload) return false
  return payload.exp * 1000 > Date.now()
}
