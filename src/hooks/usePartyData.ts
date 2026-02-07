import { useState, useEffect, useCallback, useRef } from "react"
import { fetchParties } from "@/lib/api"
import type { Party } from "@/types"

const REFRESH_INTERVAL = 30
const MAX_RETRIES = 3
const BACKOFF_BASE = 2000

function getKoreaDate(offset = 0): Date {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  )
  now.setDate(now.getDate() + offset)
  return now
}

function formatDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const DAY_NAMES_KR = ["일", "월", "화", "수", "목", "금", "토"]

function formatDateDisplay(date: Date): string {
  const today = getKoreaDate()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const dayName = DAY_NAMES_KR[date.getDay()]

  const isSameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  return `${m}/${d} (${dayName})${isSameDay ? " 오늘" : ""}`
}

/** 같은 organizer + time_slot 파티를 병합 (최신 updated_at 우선) */
function deduplicateParties(parties: Party[]): Party[] {
  const map = new Map<string, Party>()
  for (const party of parties) {
    const key = `${(party.organizer || "").toLowerCase()}|${party.time_slot}`
    const existing = map.get(key)
    if (!existing || party.updated_at > existing.updated_at) {
      map.set(key, party)
    }
  }
  return [...map.values()]
}

export function usePartyData() {
  const [allParties, setAllParties] = useState<Party[]>([])
  const [currentDate, setCurrentDate] = useState<Date>(() => getKoreaDate())
  const [includeComplete, setIncludeComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)

  const retryCountRef = useRef(0)
  const countdownRef = useRef(REFRESH_INTERVAL)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPausedRef = useRef(false)
  const isMountedRef = useRef(true)

  const loadParties = useCallback(
    async (isRetry = false) => {
      if (!isRetry) {
        setLoading(allParties.length === 0)
        setError(null)
        retryCountRef.current = 0
      }

      const dateStr = formatDateParam(currentDate)

      try {
        const data = await fetchParties(dateStr, includeComplete)
        if (!isMountedRef.current) return
        setAllParties(deduplicateParties(data.parties))
        setLoading(false)
        setError(null)
        retryCountRef.current = 0
        countdownRef.current = REFRESH_INTERVAL
        setCountdown(REFRESH_INTERVAL)
      } catch (err) {
        if (!isMountedRef.current) return

        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1
          const delay = BACKOFF_BASE * retryCountRef.current
          setTimeout(() => {
            if (isMountedRef.current) {
              loadParties(true)
            }
          }, delay)
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "데이터를 불러오는 중 오류가 발생했습니다.",
          )
          setLoading(false)
        }
      }
    },
    [currentDate, includeComplete],
  )

  const changeDate = useCallback(
    (offset: number) => {
      setCurrentDate((prev) => {
        const next = new Date(prev)
        next.setDate(next.getDate() + offset)
        return next
      })
    },
    [],
  )

  const retry = useCallback(() => {
    retryCountRef.current = 0
    loadParties()
  }, [loadParties])

  // Initial load & reload on date/filter change
  useEffect(() => {
    loadParties()
  }, [loadParties])

  // Countdown timer & auto-refresh
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) return

      countdownRef.current -= 1
      setCountdown(countdownRef.current)

      if (countdownRef.current <= 0) {
        countdownRef.current = REFRESH_INTERVAL
        setCountdown(REFRESH_INTERVAL)
        loadParties()
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [loadParties])

  // Pause refresh when tab is hidden
  useEffect(() => {
    function handleVisibility() {
      isPausedRef.current = document.hidden
      if (!document.hidden) {
        countdownRef.current = REFRESH_INTERVAL
        setCountdown(REFRESH_INTERVAL)
        loadParties()
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [loadParties])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const isToday =
    (() => {
      const today = getKoreaDate()
      return (
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getDate() === today.getDate()
      )
    })()

  return {
    allParties,
    currentDate,
    dateDisplay: formatDateDisplay(currentDate),
    isToday,
    loading,
    error,
    countdown,
    includeComplete,
    setIncludeComplete,
    changeDate,
    retry,
  }
}
