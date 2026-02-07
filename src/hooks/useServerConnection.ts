import { useState, useEffect, useCallback } from "react"
import { getServerUrl, setServerUrl, checkHealth } from "@/lib/api"

export function useServerConnection() {
  const [url, setUrl] = useState(getServerUrl)
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const check = useCallback(async () => {
    if (!url) {
      setIsConnected(false)
      return
    }
    setIsChecking(true)
    const ok = await checkHealth()
    setIsConnected(ok)
    setIsChecking(false)
  }, [url])

  const connect = useCallback(
    (newUrl: string) => {
      const trimmed = newUrl.replace(/\/+$/, "")
      setServerUrl(trimmed)
      setUrl(trimmed)
    },
    [],
  )

  useEffect(() => {
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [check])

  // URL 파라미터에서 서버 주소 읽기
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const serverParam = params.get("server")
    if (serverParam) {
      connect(serverParam)
    }
  }, [connect])

  return { url, isConnected, isChecking, connect, check }
}
