import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 100_000_000) {
    return `${(price / 100_000_000).toFixed(price % 100_000_000 === 0 ? 0 : 1)}억`
  }
  if (price >= 10_000) {
    return `${(price / 10_000).toFixed(price % 10_000 === 0 ? 0 : 0)}만`
  }
  return price.toLocaleString()
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "방금 전"
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

export function formatPriceDelta(price: number, marketPrice: number): { text: string; color: string } {
  if (marketPrice === 0) return { text: "", color: "" }
  const ratio = ((price - marketPrice) / marketPrice) * 100
  if (Math.abs(ratio) < 1) return { text: "시세적정", color: "text-muted-foreground" }
  if (ratio > 0) return { text: `시세+${Math.round(ratio)}%`, color: "text-red-400" }
  return { text: `시세${Math.round(ratio)}%`, color: "text-green-400" }
}
