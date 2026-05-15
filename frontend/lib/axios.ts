import axios from "axios"
import Cookies from "js-cookie"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = Cookies.get("refresh_token")
      if (!refreshToken) {
        Cookies.remove("access_token")
        Cookies.remove("refresh_token")
        window.location.href = "/auth/login"
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken })
        Cookies.set("access_token", data.access, { expires: 1/24, secure: true, sameSite: "strict" })
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return apiClient(originalRequest)
      } catch {
        Cookies.remove("access_token")
        Cookies.remove("refresh_token")
        window.location.href = "/auth/login"
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
