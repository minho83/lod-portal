const STORAGE_KEY = "partyServerUrl"
const DEFAULT_TIMEOUT = 8000

const ENV_SERVER_URL = (import.meta.env.VITE_SERVER_URL ?? "").replace(/\/+$/, "")

export function getServerUrl(): string {
  return localStorage.getItem(STORAGE_KEY) || ENV_SERVER_URL
}

export function setServerUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY, url.replace(/\/+$/, ""))
}

async function fetchWithTimeout(
  url: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { signal: controller.signal })
    return response
  } finally {
    clearTimeout(id)
  }
}

export async function checkHealth(): Promise<boolean> {
  const serverUrl = getServerUrl()
  if (!serverUrl) return false
  try {
    const res = await fetchWithTimeout(`${serverUrl}/health`, 5000)
    return res.ok
  } catch {
    return false
  }
}

export async function fetchParties(
  date: string,
  includeComplete = false,
): Promise<{ parties: import("@/types").Party[] }> {
  const serverUrl = getServerUrl()
  const params = new URLSearchParams({ date })
  if (includeComplete) params.set("include_complete", "true")
  const res = await fetchWithTimeout(
    `${serverUrl}/api/party/vacancy?${params}`,
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function searchDatabase(
  query: string,
  category = "all",
  limit = 20,
): Promise<{ results: import("@/types").SearchResult[] }> {
  const serverUrl = getServerUrl()
  const params = new URLSearchParams({ q: query, limit: String(limit) })
  if (category !== "all") params.set("category", category)
  const res = await fetchWithTimeout(`${serverUrl}/api/search?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchWiki(): Promise<{ blocks: unknown[] }> {
  // Notion Public 페이지 직접 조회
  const pageId = "18d50fc9dbd282998b9881d7d965f53f"

  try {
    // Notion Public API 프록시 사용 (notion-api.splitbee.io)
    const res = await fetchWithTimeout(
      `https://notion-api.splitbee.io/v1/page/${pageId}`,
      15000
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } catch (error) {
    // 프록시 실패 시 서버 API로 폴백
    try {
      const serverUrl = getServerUrl()
      if (!serverUrl) throw new Error("서버 URL이 설정되지 않았습니다")
      const res = await fetchWithTimeout(`${serverUrl}/api/wiki`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch {
      throw error // 원래 에러를 던짐
    }
  }
}
