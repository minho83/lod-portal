const STORAGE_KEY = "partyServerUrl"
const DEFAULT_TIMEOUT = 8000

export function getServerUrl(): string {
  return localStorage.getItem(STORAGE_KEY) || ""
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
  const serverUrl = getServerUrl()
  const res = await fetchWithTimeout(`${serverUrl}/api/wiki`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
