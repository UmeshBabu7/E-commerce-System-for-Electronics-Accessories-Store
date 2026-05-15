import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  return `NPR ${Number(amount).toFixed(2)}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-NP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
