// ── Types & Constants ──

export { findMinStatForExp, STAT_UPPER_BOUND } from "@/lib/calculator"

export interface CalcSettings {
  discountRate: number
  exchangeRate: number
  dailyFreeRar: number
  weeklyFreeRar: number
  targetDays: number
}

export const DEFAULT_SETTINGS: CalcSettings = {
  discountRate: 0,
  exchangeRate: 6000,
  dailyFreeRar: 0,
  weeklyFreeRar: 0,
  targetDays: 0,
}

export const STORAGE_KEY = "lodCalcSettings"

export const QUICK_BUTTONS = [
  { label: "+100만", value: 1_000_000 },
  { label: "+10만", value: 100_000 },
  { label: "+1만", value: 10_000 },
  { label: "+천", value: 1_000 },
  { label: "+백", value: 100 },
] as const

// ── Settings Persistence ──

export function loadSettings(): CalcSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_SETTINGS
    const s = JSON.parse(saved)
    return {
      discountRate: Math.max(0, Math.min(99, Number(s.discountRate) || 0)),
      exchangeRate: Math.max(100, Number(String(s.exchangeRate).replace(/,/g, "")) || 6000),
      dailyFreeRar: Math.max(0, Number(String(s.dailyFreeRar).replace(/,/g, "")) || 0),
      weeklyFreeRar: Math.max(0, Number(String(s.weeklyFreeRar).replace(/,/g, "")) || 0),
      targetDays: Math.max(0, Number(String(s.targetDays).replace(/,/g, "")) || 0),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: CalcSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
