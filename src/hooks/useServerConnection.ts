import { useState, useEffect, useCallback } from "react"
import { getServerUrl, setServerUrl, checkHealth } from "@/lib/api"

export function useServerConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const check = useCallback(async () => {
    const url = getServerUrl()
    if (!url) {
      setIsConnected(false)
      return
    }
    setIsChecking(true)
    const ok = await checkHealth()
    setIsConnected(ok)
    setIsChecking(false)
  }, [])

  useEffect(() => {
    // URL 파라미터로 서버 주소 오버라이드 (개발/테스트용)
    const params = new URLSearchParams(window.location.search)
    const serverParam = params.get("server")
    if (serverParam) {
      setServerUrl(serverParam)
    }

    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [check])

  return { isConnected, isChecking, check }
}
