"use client"
type ToastOptions = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function toast(options: ToastOptions) {
  if (typeof window !== "undefined") {
  
    console.log(`[Toast] ${options.variant === "destructive" ? "ERROR" : "INFO"}: ${options.title}`)
  }
}

export function useToast() {
  return { toast }
}
