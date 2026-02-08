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

/**
 * 예정 시간을 상대적으로 표시 (오늘, 내일, +N일)
 */
export function formatScheduledDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ""

  const scheduled = new Date(dateStr)
  const now = new Date()

  // 오늘, 내일 계산을 위해 날짜만 비교
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const scheduledStart = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate())

  const dayDiff = Math.floor((scheduledStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))

  const timeStr = scheduled.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  if (dayDiff === 0) {
    return `오늘 ${timeStr}`
  } else if (dayDiff === 1) {
    return `내일 ${timeStr}`
  } else if (dayDiff > 1) {
    return `+${dayDiff}일 ${timeStr}`
  } else {
    // 과거 날짜는 그대로 표시
    return scheduled.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }
}
